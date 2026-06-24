# Risk Gate Checklist

Mark any touched area:

- [ ] auth
- [ ] session / token / cookie
- [ ] permission / roles
- [ ] regulated operation
- [ ] irreversible operation
- [ ] value transfer
- [ ] safety-critical behavior
- [ ] production database
- [ ] migration
- [ ] destructive data operation
- [ ] production config
- [ ] secrets
- [ ] personal data
- [ ] regulated data
- [ ] external side-effect API
- [ ] infrastructure

If any item is checked:

- [ ] Task is at least L2
- [ ] Human approval recorded
- [ ] Rollback plan exists
- [ ] Required tests exist
- [ ] Audit log requirement reviewed
- [ ] Release gate required if production impact exists
