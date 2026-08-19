# Security Specification & Threat Model

## 1. Data Invariants
1. **Admin Master Authorization**: Only verified users who match the bootstrapped admin email `mdomrfaruk111@gmail.com` or exist in `/admins/{adminId}` can access `/admin/*` operations, audit logs, and administrative settings.
2. **Product Catalog Protection**: Products can be viewed by anyone, but created, updated, and deleted only by authenticated administrators.
3. **Order Ownership & Integrity**: Customers can create orders and read their own orders. Resellers can view orders linked to their `resellerId`. Administrators can view, update status, and manage all orders.
4. **Reseller Wallet & Earnings Isolation**: A reseller may only view their own wallet and request withdrawals for their own account up to their available balance. Only administrators can approve or reject withdrawals and adjust balances.
5. **PII and Profile Isolation**: A user's profile in `/users/{userId}` can only be read and updated by that authenticated user or an administrator. Users cannot grant themselves the admin role.
6. **Support Tickets**: Support inquiries can be submitted by guests/users. Only ticket creators and administrators can read tickets; only administrators can post official replies or change ticket resolution status.
7. **Store Settings**: Settings are publicly readable for storefront configuration (contact phone `01331993380`, email `mdomrfaruk111@gmail.com`, currency, fees) but strictly editable only by administrators.

## 2. The Dirty Dozen Attack Payloads (Must be Blocked)
1. **Ghost Admin Escalation**: User tries to write `{ "role": "admin" }` to their own `/users/{uid}` profile.
2. **Unauthorized Product Insertion**: Non-admin attempts to `create` a new document in `/products`.
3. **Price Tampering**: Customer tries to `update` a product's price from 1500 to 10.
4. **Order Status Hijack**: Customer attempts to change their own order status to `delivered` or `paid`.
5. **Withdrawal Approval Forgery**: Reseller sends an update to `/withdrawals/{id}` setting `status: "approved"`.
6. **Negative Balance Exploit**: Malicious reseller requests a withdrawal with negative amount `-5000`.
7. **Impersonated Order Creation**: User A creates an order with `customerId: "userB"`.
8. **Setting Overwrite**: Attacker tries to modify contact email or phone in `/settings/general`.
9. **Audit Log Erasure**: Attacker tries to delete or modify documents in `/audit_logs`.
10. **Other User Wallet Drain**: User A attempts to write or read `/wallets/userB`.
11. **Excessive String Payload Attack**: Attacker injects a 5MB payload into a support ticket message.
12. **Unauthenticated Admin Claim**: Unauthenticated request tries to read administrative logs or reseller financial ledgers.
