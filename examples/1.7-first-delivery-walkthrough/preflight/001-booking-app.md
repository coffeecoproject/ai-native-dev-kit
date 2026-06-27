# Preflight Report: Booking Mini App First Slice

## Problem Summary

The user needs a first visible demo for booking services.

## Missing Information

- exact service categories
- slot length
- whether staff assignment is needed
- backend storage choice
- privacy policy requirements

## Assumptions

- Demo data is local or mocked.
- Phone number is entered for demo only and not stored in production.
- Payment is excluded.
- Production release is excluded.

## Non-goals

- payment
- backend admin
- production deployment
- privacy/compliance approval

## Risk Areas

- phone number handling
- future payment integration
- future real customer data

## Suggested Task Split

1. First demo slice: service, slot, contact, confirmation.
2. Data persistence decision.
3. Admin schedule management.
4. Payment decision.

## Acceptance Criteria

- User can select one service.
- User can select one available time.
- User can enter name and phone.
- User can see a confirmation summary.
- Demo clearly states it is not a production launch.

## Test Plan

- local flow smoke
- form validation smoke
- empty-state smoke
- launch readiness report

## Ready / Not Ready Decision

Ready for first demo slice after the human confirms payment is deferred.
