---
title: "How to Accept Mobile Money Payments on Your Website or App in Ghana"
excerpt: MTN MoMo, Telecel Cash, AT Money and cards. How online payments work in Ghana, the ways to connect them, what they cost, and the mistakes to avoid.
image: https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=600&fit=crop&auto=format&q=75
category: Payments
author: Nesisoft Team
date: 2026-11-11T09:02:00Z
---

In Ghana, mobile money is how people pay. Bank of Ghana data shows mobile money transactions worth GH¢492.9 billion in June 2026 alone, across 954 million transactions. If your website or app can't take MoMo, a lot of your customers can't pay you.

The good news is that accepting mobile money online is a solved problem. This guide covers how it works, the main ways to set it up, what it costs, and the mistakes we see most often.

## The ways your customers pay

- **MTN Mobile Money (MoMo):** by far the largest network.
- **Telecel Cash:** formerly Vodafone Cash.
- **AT Money:** formerly AirtelTigo Money. AirtelTigo became AT in 2023.
- **Cards:** Visa and Mastercard. These matter for corporate clients, for customers abroad and for Ghanaians in the diaspora paying for family at home.

A good checkout accepts all of them. Leaving one network out means turning away everyone who uses it.

## How a mobile money payment works online

From your customer's side, it takes under a minute:

1. They choose mobile money at checkout and enter their number.
2. A prompt appears on their phone asking them to approve the payment with their PIN.
3. They approve it, and your site or app confirms the payment and shows a receipt.

Behind the scenes, there's more going on:

1. Your system creates a payment request with a payment provider, with the amount and your own reference, such as an order or invoice number.
2. The provider sends the prompt to the customer's phone through their network.
3. The customer approves, declines, or walks away.
4. The provider tells your server the result through a webhook, which is a message sent from their server to yours.
5. Your server checks the result with the provider, then marks the order as paid and sends the receipt.

Step 5 is the one that matters most. A payment should only count once your server has confirmed it with the provider. A message from the customer's browser saying "success" isn't proof.

## Three ways to connect

### 1. A payment gateway (where most businesses start)

A gateway, also called a payment aggregator, connects to all the mobile money networks and the card schemes for you. You integrate once and accept MTN, Telecel, AT and cards. Paystack, Hubtel and Flutterwave are among the providers that support mobile money in Ghana.

You get a dashboard of transactions, refunds, payouts to your bank or merchant wallet, and reports for reconciliation. For most websites and apps, this is the right choice.

### 2. Direct integration with a network

Large organisations sometimes connect to a network directly. MTN, for example, runs a developer platform for its MoMo API. This can make sense at very high volume, but it means a separate agreement, integration and reconciliation for each network. For most businesses, the gateway route is simpler and quicker.

### 3. Payment links, with no integration

If you just need to collect payments now, most gateways let you create payment links and invoices from their dashboard and share them on WhatsApp or by email. This needs no development at all. The catch is that payments aren't connected to your orders or records, so someone has to match them up by hand. It's a good stopgap, not a system.

## What you'll need to get started

Each provider has its own checklist, but expect to provide:

- Your business registration documents
- ID for the owners or directors, usually the Ghana Card
- A bank account or merchant mobile money wallet to receive your money
- Details of what you sell and your website or app

Approval can take a few days, so start the paperwork early. Development can begin in the provider's test mode while you wait.

## What it costs

Gateways usually charge no setup fee. Instead they take a percentage of each payment, often around 2% for local mobile money and card payments, with international cards costing more. Payouts to your bank or wallet may carry a small fee too. Rates change and differ between providers, so check their current pricing pages before you choose.

Decide early who pays the fee. Most businesses build it into their prices. Some providers let you pass it on to the customer, but check their terms first, and be upfront about it at checkout.

Building the integration into your website or app is a one-off cost. In our [app cost calculator](/app-cost-calculator), mobile money and card payments add around GH₵6,000 to a medium-sized build at the time of writing.

## Six mistakes to avoid

**1. Trusting the browser.** Never mark an order as paid because the customer's screen said so. Confirm every payment on your server with the provider.

**2. Forgetting about pending payments.** Customers get distracted, prompts time out, and phones run out of battery. Your system needs to handle payments that are still pending, release stock or bookings that were never paid for, and let the customer try again without paying twice.

**3. Asking for a PIN.** Your website or app should never ask for a mobile money PIN. Customers enter it only in the prompt on their own phone. A form that asks for it looks exactly like a scam, because that's what scams do.

**4. Testing on one network only.** Test with real MTN, Telecel and AT numbers before launch, along with a card. Each network's prompt looks a little different, and your instructions on screen should cover all of them.

**5. Receipts without a reference.** Every receipt, by SMS or email, should show your reference and the amount. When a customer calls to say "I paid", support needs to find the payment in seconds.

**6. Never reconciling.** Compare the provider's report with your own records regularly, daily if you're busy. Mismatches are much easier to sort out the next day than the next quarter.

## Beyond simple payments

Once payments work, you can build on them:

- **Instalments and part-payments,** for school fees or buy-now-pay-later
- **Recurring payments,** for subscriptions and memberships
- **Payouts,** to pay riders, agents or suppliers from your system
- **Split payments,** for marketplaces that pay sellers and keep a commission
- **Refunds,** issued from your admin dashboard instead of by hand

## Payments are built into what we make

Payments sit at the centre of the platforms we're building. [Adesuapa](/platforms/adesuapa), now in beta, is built around paying for online courses by mobile money, and [Jua](/platforms/jua), in development, lets businesses buy in instalments. We integrate payments for clients' websites and apps too, from simple checkouts to [fintech products](/industries/fintech).

Planning a website or app that takes payments? [Get an estimate](/app-cost-calculator) in two minutes, or [tell us what you're building](/contact).
