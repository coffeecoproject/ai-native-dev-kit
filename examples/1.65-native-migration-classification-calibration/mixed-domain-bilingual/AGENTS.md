# Project Agent Rules

## Business And Data Rules

Customer invoice status schema must preserve tax meaning.
客户合同金额和发票税务口径必须按已确认协议执行。

## Release Rules

生产上线必须保留回滚记录，并由发布负责人确认。

## Simple Rule Table

| Area | Rule |
| --- | --- |
| Permission | Admin role changes require owner approval. |
| Finance | Invoice approval limits stay with finance owner. |

## Complex Rule Table

| Area | Owner | Rule | Exception |
| --- | --- | --- | --- |
| Production | release owner | Secrets rotation and rollback evidence must match production SOP. | Emergency exception requires incident owner. |

## Workflow Rules

Codex should record review evidence before replacing old workflow rules.
