# Decision Brief: Status Model Pattern

## Human Summary

This example chooses a state machine for status transitions because transition rules matter more than the number of values.

## Decision Needed

How should status-like values be represented when values participate in transitions?

## Options

| Option | Good For | Risk |
|---|---|---|
| string | external boundary values | weak internal safety |
| union type | stable code-owned sets | no transition rules |
| database enum | strong storage constraint | migration and rollback cost |
| lookup table | configurable labels or ordering | operational ownership needed |
| state machine | explicit transitions | requires decision and tests |

## Recommendation

Use a state machine for transition-controlled status values. Keep external raw strings at the boundary and map them into domain values.

## Human Decision

Status: APPROVED

Owner: intentos example owner
