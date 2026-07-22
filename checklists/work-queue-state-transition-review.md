# Work Queue State Transition Review

- [ ] The predecessor snapshot remains byte-for-byte unchanged.
- [ ] The predecessor item exists and records `CURRENT` in its immutable snapshot.
- [ ] The successor item exists and records `CURRENT` in its immutable snapshot.
- [ ] Both source refs include exact task ID fragments and current source digests.
- [ ] The intent digests match their Work Queue rows.
- [ ] The sequence is unique and continues the prior successor without a fork.
- [ ] An explicit current user decision ref is recorded.
- [ ] No implementation, commit, push, release, or production authority is claimed.
- [ ] Work Queue and Takeover consumers project exactly one effective `CURRENT` task.
