# MVP Booking Web App

## Original user goal

I want to build a simple booking app.

## Human decisions

1. First version uses Web.
2. First version uses local demo data.
3. Payment, login, SMS, production release, and complex permissions stay out of scope.

## Run

Open `src/index.html` in a browser.

## Verify

```bash
npm test
```

## What works

- Visitor fills name, phone, service, date, and time.
- Visitor submits a booking.
- Operator can see the booking in a local list.
- Empty state appears before bookings exist.

## Boundary

This is local demo evidence only. It is not production release approval and does not prove real-user adoption.
