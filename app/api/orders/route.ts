import { NextRequest, NextResponse } from 'next/server';
import { sendPushToAll } from '@/lib/send-push';
import { getOrders, addOrder } from '@/lib/orders-db';

export async function GET() {
  const orders = await getOrders();
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      message,
      items: cartItems,
      productName,
      productSlug,
      color,
      size,
      quantity,
      totalPrice,
    } = body;

    if (!firstName?.trim() || !lastName?.trim() || !phone?.trim() || !address?.trim()) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : prénom, nom, téléphone, adresse.' },
        { status: 400 }
      );
    }

    let newOrder: any;

    if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
      const total = cartItems.reduce(
        (sum: number, it: any) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
        0
      );
      newOrder = {
        id: `ORD-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
        customer: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: (email || '').trim(),
        },
        delivery: {
          address: address.trim(),
          city: (city || 'Dakar').trim(),
        },
        items: cartItems.map((it: any) => ({
          name: it.name,
          slug: it.slug,
          color: it.color,
          size: Number(it.size),
          quantity: Number(it.quantity) || 1,
          price: Number(it.price),
        })),
        totalPrice: total,
        message: (message || '').trim(),
      };
    } else {
      if (!productName || !size || totalPrice == null) {
        return NextResponse.json(
          { error: 'Champs obligatoires manquants : produit, pointure, prix.' },
          { status: 400 }
        );
      }
      newOrder = {
        id: `ORD-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
        customer: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: (email || '').trim(),
        },
        delivery: {
          address: address.trim(),
          city: (city || 'Dakar').trim(),
        },
        product: {
          name: productName,
          slug: productSlug,
          color,
          size: Number(size),
          quantity: Number(quantity) || 1,
          totalPrice: Number(totalPrice),
        },
        message: (message || '').trim(),
      };
    }

    await addOrder(newOrder);

    const total = newOrder.totalPrice ?? newOrder.product?.totalPrice ?? 0;
    const summary = newOrder.items
      ? `${newOrder.items.length} article(s) • ${total.toLocaleString('fr-FR')} FCFA`
      : `${newOrder.product?.name} • ${total.toLocaleString('fr-FR')} FCFA`;
    await sendPushToAll(
      'Nouvelle commande Crocsdkr',
      `${newOrder.customer.firstName} ${newOrder.customer.lastName} — ${summary}`
    ).catch(() => {});

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error) {
    console.error('Erreur:', error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de l'enregistrement de la commande";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
