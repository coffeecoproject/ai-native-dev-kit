# Spec: Booking Mini App First Slice

## Human Summary

Build a demo booking flow for one service category and mocked available time slots.

## Included

- service selection
- date and time selection
- customer name field
- customer phone field
- confirmation summary
- local-only verification

## Excluded

- payment
- production database
- admin console
- notifications
- release approval

## User Flow

1. Customer opens the booking page.
2. Customer selects a service.
3. Customer selects a date and time slot.
4. Customer enters name and phone.
5. Customer confirms and sees the booking summary.

## Data

Use demo data:

- service id
- service name
- slot id
- slot time
- customer name
- customer phone

Do not define production storage in this slice.

## Human Decisions

Payment is deferred. Real customer data handling needs a future privacy decision.
