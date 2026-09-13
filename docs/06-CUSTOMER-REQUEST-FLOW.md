# Customer Request Flow — End-to-End Design

> Complete lifecycle of a customer request from submission to completion.

---

## 1. Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER JOURNEY                              │
│                                                                      │
│  ① Browse → ② View Post → ③ Fill Form → ④ Submit → ⑤ Get Response  │
└──────────────────────────────────────────────────────────────────────┘
        │             │             │             │             │
        ▼             ▼             ▼             ▼             ▼
  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐
  │ HomePage │ │ PostDetail │ │ App Form │ │   API     │ │ Success  │
  │ /        │ │ /post/:id  │ │ Component│ │ POST req  │ │ Message  │
  └──────────┘ └───────────┘ └──────────┘ └─────┬─────┘ └──────────┘
                                                 │
                                          ┌──────▼──────┐
                                          │   SERVER     │
                                          │              │
                                          │ 1. Validate  │
                                          │ 2. Fetch Post│
                                          │ 3. Get Ops   │
                                          │ 4. Assign    │
                                          │ 5. Save      │
                                          │ 6. Respond   │
                                          └──────┬───────┘
                                                 │
                                    ┌────────────▼────────────┐
                                    │   OPERATOR DASHBOARD     │
                                    │                          │
                                    │  New request appears in  │
                                    │  operator's queue with   │
                                    │  status: "Assigned"      │
                                    │                          │
                                    │  ⑥ Operator contacts     │
                                    │  ⑦ Updates status        │
                                    │  ⑧ Adds notes/message    │
                                    │  ⑨ Marks complete        │
                                    └──────────────────────────┘
```

---

## 2. Status Lifecycle

```
                    ┌─────────┐
                    │ PENDING │  (form submitted, before assignment)
                    └────┬────┘
                         │ Auto-assign to operator
                    ┌────▼────┐
                    │ASSIGNED │  (operator can see in queue)
                    └────┬────┘
                         │ Operator starts working
                    ┌────▼────────┐
                    │ IN_PROGRESS │  (documents being verified)
                    └────┬────────┘
                         │ Operator calls/messages customer
                    ┌────▼──────┐
                    │ CONTACTED │  (customer has been reached)
                    └────┬──────┘
                         │
                ┌────────┼────────┐
                ▼        ▼        ▼
          ┌──────────┐ ┌────────┐ ┌──────────┐
          │COMPLETED │ │REJECTED│ │CANCELLED │
          │  ✅      │ │  ❌    │ │  🚫      │
          └──────────┘ └────────┘ └──────────┘
```

### Status Descriptions

| Status        | Who Sets It | Description                                    |
|---------------|-------------|------------------------------------------------|
| `pending`     | System      | Request just submitted, assignment in progress |
| `assigned`    | System      | Auto-assigned to an operator                   |
| `in_progress` | Operator    | Operator is actively working on request        |
| `contacted`   | Operator    | Operator has contacted the customer             |
| `completed`   | Operator    | Service successfully delivered                 |
| `rejected`    | Operator    | Request cannot be fulfilled (reason required)  |
| `cancelled`   | Admin       | Admin cancelled the request                    |

---

## 3. Assignment Algorithm — Round-Robin

### Why Round-Robin?

- **Fair distribution**: Every operator gets equal number of requests
- **Predictable load**: No operator gets overwhelmed
- **Simple to implement**: Single counter tracking
- **Auditable**: Clear assignment history

### Algorithm Steps

```
Step 1: Get all active operators sorted by sortOrder
        operators = [Op1, Op2, Op3, Op4]

Step 2: Get last assigned index from counter
        lastAssignedIndex = 2  (Op3 was last assigned)

Step 3: Calculate next index
        nextIndex = (2 + 1) % 4 = 3  → Op4

Step 4: Assign request to Op4

Step 5: Update counter
        lastAssignedIndex = 3

Step 6: Next request → (3 + 1) % 4 = 0 → Op1  (wraps around)
```

### Edge Cases

| Scenario                    | Handling                                       |
|-----------------------------|------------------------------------------------|
| No active operators         | Return error: "No operators available"         |
| Only 1 active operator      | Always assign to that operator                 |
| Operator deactivated        | Skip in next assignment, recalculate index     |
| New operator added          | Joins rotation at end of queue                 |
| Operator deleted            | Counter resets if index exceeds operator count |

### Backend Implementation

```javascript
// routes/customerRequests.js

router.post('/', async (req, res) => {
    try {
        const { customerName, customerPhone, customerAge, 
                customerEmail, customerMessage, postId } = req.body;

        // 1. Validate required fields
        if (!customerName || !customerPhone || !postId) {
            return res.status(400).json({
                message: 'Name, phone, and service selection are required'
            });
        }

        // 2. Validate phone format
        const phoneRegex = /^[6-9]\d{9}$/;
        const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
        if (!phoneRegex.test(cleanPhone)) {
            return res.status(400).json({
                message: 'Please enter a valid 10-digit phone number'
            });
        }

        // 3. Fetch post to get service details
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // 4. Check if post is still active
        if (new Date(post.endDate) < new Date()) {
            return res.status(400).json({
                message: 'This service application period has ended'
            });
        }

        // 5. Get active operators
        const operators = await Operator.find({ isActive: true })
            .sort({ sortOrder: 1 });

        if (operators.length === 0) {
            return res.status(503).json({
                message: 'No operators available. Please try again later.'
            });
        }

        // 6. Round-robin assignment
        let counter = await AssignmentCounter.findOne({});
        if (!counter) {
            counter = await AssignmentCounter.create({
                lastAssignedIndex: -1,
                totalRequests: 0
            });
        }

        const nextIndex = (counter.lastAssignedIndex + 1) % operators.length;
        const assignedOperator = operators[nextIndex];

        // 7. Create customer request
        const request = await CustomerRequest.create({
            customerName: customerName.trim(),
            customerAge,
            customerPhone: cleanPhone,
            customerEmail: customerEmail?.trim().toLowerCase(),
            customerMessage: customerMessage?.trim(),
            postId,
            serviceName: post.titleEn,
            serviceCategory: post.category,
            assignedTo: assignedOperator._id,
            assignedAt: new Date(),
            status: 'assigned',
            statusHistory: [
                { status: 'pending', timestamp: new Date(), note: 'Request submitted' },
                {
                    status: 'assigned',
                    timestamp: new Date(),
                    note: `Auto-assigned to ${assignedOperator.name}`
                }
            ]
        });

        // 8. Update counter & operator stats
        counter.lastAssignedIndex = nextIndex;
        counter.totalRequests += 1;
        await counter.save();

        assignedOperator.totalAssigned += 1;
        assignedOperator.lastAssignedAt = new Date();
        await assignedOperator.save();

        // 9. Return success
        res.status(201).json({
            message: 'Application submitted successfully! Our operator will contact you shortly.',
            request: {
                _id: request._id,
                serviceName: request.serviceName,
                status: request.status,
                assignedOperator: {
                    name: assignedOperator.name,
                    phone: assignedOperator.phone
                }
            }
        });

    } catch (err) {
        console.error('CustomerRequest creation error:', err);
        res.status(500).json({ message: 'Failed to submit request. Please try again.' });
    }
});
```

---

## 4. Operator Request Management

### What Operators See

When an operator logs in, they see a queue of customer requests assigned to them.

#### Request List View
```
┌─────────────────────────────────────────────────────┐
│  📋 My Customer Requests                     [12]   │
│                                                     │
│  Filter: [All ▼] [Assigned ▼]  Search: [________]  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ 🟡 NEW                                      │    │
│  │ Suresh Reddy • PAN Correction               │    │
│  │ 📱 9988776655 • Sep 10, 2:30 PM             │    │
│  │ "I need help with PAN card correction"       │    │
│  │ [Open Details]                                │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ 🔵 IN PROGRESS                               │    │
│  │ Lakshmi Devi • Aadhaar Update                │    │
│  │ 📱 9876543210 • Sep 9, 11:00 AM              │    │
│  │ [Open Details]                                │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

#### Request Detail View (Expandable)
```
┌─────────────────────────────────────────────────────┐
│  Customer: Suresh Reddy                             │
│  Age: 25 | Phone: 9988776655 | Email: s@gmail.com  │
│                                                     │
│  Service: PAN Card Correction 2026                  │
│  Category: 🪪 PAN Card                             │
│  Applied: Sep 10, 2026 at 2:30 PM                  │
│                                                     │
│  Customer Message:                                  │
│  "I need help with PAN card correction. My name     │
│   is spelled wrong on the card."                    │
│                                                     │
│  ─────────────────────────────────────────────      │
│                                                     │
│  Update Status: [In Progress ▼]                     │
│                                                     │
│  Internal Notes (only you and admin can see):       │
│  ┌──────────────────────────────────────────┐       │
│  │ Customer needs PAN correction for name   │       │
│  │ spelling. Documents verified.             │       │
│  └──────────────────────────────────────────┘       │
│                                                     │
│  Message to Customer:                               │
│  ┌──────────────────────────────────────────┐       │
│  │ We've received your request. Please send │       │
│  │ your Aadhaar and old PAN copy on WhatsApp│       │
│  └──────────────────────────────────────────┘       │
│                                                     │
│  [💬 WhatsApp] [📞 Call] [💾 Save Changes]          │
└─────────────────────────────────────────────────────┘
```

### Operator Actions

| Action              | Description                                    |
|---------------------|------------------------------------------------|
| Change Status       | Move request through lifecycle stages          |
| Add Internal Notes  | Private notes (visible to self + admin only)   |
| Send Message        | Custom message visible to admin for tracking   |
| Call Customer       | Direct dial from request card                  |
| WhatsApp Customer   | Open WhatsApp chat with customer               |
| Mark Complete       | Finalize the request (sets completedAt)        |
| Reject              | Reject with reason (requires note)             |

---

## 5. Admin Request Management

### Admin-Only Actions

| Action           | Description                                       |
|------------------|---------------------------------------------------|
| View All         | See all requests across all operators              |
| Filter by Op     | View specific operator's queue                     |
| Reassign         | Move request to a different operator               |
| Cancel           | Cancel a request (with reason)                     |
| View History     | See full status change history with timestamps     |
| Bulk Update      | Select multiple → change status                    |
| Statistics       | Total requests, by status, by category, by date    |

---

## 6. Duplicate Prevention

### Strategy
Prevent the same customer from submitting multiple requests for the same service.

```javascript
// Check for duplicate before creating
const existing = await CustomerRequest.findOne({
    customerPhone: cleanPhone,
    postId,
    status: { $nin: ['completed', 'rejected', 'cancelled'] }
});

if (existing) {
    return res.status(409).json({
        message: 'You have already submitted a request for this service. Our operator will contact you soon.'
    });
}
```

---

## 7. Notification Strategy (Future Enhancement)

| Event                  | Customer Gets         | Operator Gets           |
|------------------------|-----------------------|-------------------------|
| Request submitted      | Success message (UI)  | New request in queue    |
| Status changed         | (future: SMS/WhatsApp)| Dashboard update        |
| Request completed      | (future: email)       | Counter update          |
| Request rejected       | (future: reason SMS)  | —                       |

### Phase 1 (Current): UI-only notifications
### Phase 2 (Future): WhatsApp Business API integration
### Phase 3 (Future): Email notifications via SendGrid/Nodemailer
