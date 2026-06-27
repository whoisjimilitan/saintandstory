# WhatsApp Real-Time Conversation Engine - BUILD TODO

## BUILD ORDER (Strategic)

### PHASE 1: Core WhatsApp Infrastructure
- [ ] 1.1 Create WhatsApp Chat UI Component (`components/WhatsAppChat.tsx`)
      - Real-time message display (sent/received)
      - Message input field
      - Typing indicators
      - Premium/sleek design (minimal, clean)
      - Test: Render locally, verify styling

- [ ] 1.2 Create WhatsApp Conversation Manager Service (`lib/whatsapp-conversation.ts`)
      - Store conversation state
      - Add messages to conversation
      - Track delivery/read status
      - Test: State management

- [ ] 1.3 Create WhatsApp Send API (`app/api/whatsapp/send/route.ts`)
      - Accept: phone_number, message, business_context
      - Call WhatsApp API (mock for now)
      - Return: message_id, timestamp, status
      - Test: API response format

### PHASE 2: Conversation Dashboard
- [ ] 2.1 Create Conversations List Component (`components/ConversationsList.tsx`)
      - Display active conversations
      - Show last message + timestamp
      - Show unread count
      - Search/filter
      - Premium aesthetic
      - Test: Render with mock data

- [ ] 2.2 Create Conversation Page (`app/operator/whatsapp/[id]/page.tsx`)
      - Load conversation history
      - Display chat UI
      - Show business details on sidebar
      - Test: Navigation and data loading

- [ ] 2.3 Create Conversations Dashboard (`app/operator/whatsapp/page.tsx`)
      - List all conversations
      - Quick stats (active, hot, waiting)
      - Start new conversation button
      - Test: Layout and functionality

### PHASE 3: Quick Send & Standing Orders
- [ ] 3.1 Create Quick Send Component (`components/QuickSendMessage.tsx`)
      - Phone number input
      - Auto-generate message (WhatsApp psychology)
      - Preview message before send
      - Send button
      - Test: Message generation

- [ ] 3.2 Create Standing Order Modal (`components/CreateStandingOrderFromChat.tsx`)
      - Triggered from within chat
      - Auto-fill: business_name, phone, contact_person
      - Simple form (frequency, price, postcode)
      - One-click create
      - Test: Form submission

- [ ] 3.3 Create Standing Order API (`app/api/whatsapp/standing-orders/route.ts`)
      - Accept conversation context
      - Create standing order in b2b_standing_orders
      - Link to conversation
      - Return: confirmation
      - Test: Database insert

### PHASE 4: TODAY Page Redesign
- [ ] 4.1 Redesign TODAY Page (`app/operator/page.tsx`)
      - New section: "WhatsApp Conversations" (TOP)
      - Show: Active conversations, hot leads, standing orders created today
      - Link to: /operator/whatsapp
      - Remove: Complex campaign builder UI
      - Test: Visual design, navigation

- [ ] 4.2 Add WhatsApp Metrics Widget
      - Active conversations count
      - Messages sent today
      - Standing orders created from WhatsApp
      - Test: Metric calculation

### PHASE 5: Integration & Polish
- [ ] 5.1 Connect WhatsApp Send to Psychology Framework
      - Use `outreach-message-generator.ts` for WhatsApp strategy
      - Generate personalized message (not template)
      - Validate psychology before send
      - Test: Message quality

- [ ] 5.2 Database Schema Update
      - Add `phone` to b2b_leads (if not exist)
      - Add `whatsapp_conversation_id` to b2b_standing_orders
      - Verify indexes
      - Test: Schema integrity

- [ ] 5.3 Remove Campaign Builder Complexity
      - Delete: `campaign-builder.tsx`
      - Delete: `outreach-response-formatter.ts`
      - Keep: `outreach-message-generator.ts` (WhatsApp strategy only)
      - Clean up: campaigns page
      - Test: No broken imports

### PHASE 6: Runtime Testing
- [ ] 6.1 Test WhatsApp Send Flow
      - Navigate to /operator/whatsapp
      - Start new conversation
      - Enter phone number
      - Generate message (psychology framework)
      - Click Send
      - Verify: Message appears in chat
      - Test: Live send (with mock API)

- [ ] 6.2 Test Standing Order Creation
      - Within chat, click "Create Standing Order"
      - Fill form: frequency, price, postcode
      - Click Create
      - Verify: Appears in /operator/orders
      - Test: Data persistence

- [ ] 6.3 Test TODAY Page
      - Verify new WhatsApp section prominent
      - Verify metrics update
      - Verify links to /operator/whatsapp work
      - Test: Visual hierarchy, sleekness

- [ ] 6.4 Test Premium/Sleek Aesthetic
      - No wordiness (remove descriptions)
      - Minimal UI (only essential controls)
      - Clean typography
      - Proper spacing
      - Test: Visual polish

### PHASE 7: First Live WhatsApp Send
- [ ] 7.1 Configure WhatsApp API credentials
- [ ] 7.2 Send first test message
- [ ] 7.3 Verify delivery
- [ ] 7.4 Receive response
- [ ] 7.5 Create standing order from response

---

## BUILD STATUS

**Phase 1:** ⏳ Starting
**Phase 2:** ⏳ Pending
**Phase 3:** ⏳ Pending
**Phase 4:** ⏳ Pending
**Phase 5:** ⏳ Pending
**Phase 6:** ⏳ Pending
**Phase 7:** ⏳ Pending

---

## EXPECTED OUTCOME

When complete:
- ✅ WhatsApp real-time conversation UI
- ✅ One-click standing order creation
- ✅ TODAY page showcases conversations as core engine
- ✅ Premium, sleek, minimal aesthetic
- ✅ Psychology framework locked for WhatsApp
- ✅ Ready for first live WhatsApp send
- ✅ Email psychology framework ready for integration (future)


---

## BUILD PROGRESS UPDATE

### PHASE 1: ✅ COMPLETE
- [x] 1.1 WhatsApp Chat UI Component
- [x] 1.2 Conversation Manager Service  
- [x] 1.3 WhatsApp Send API
✓ Build: PASSING

### PHASE 2: ✅ COMPLETE
- [x] 2.1 Conversations List Component
- [x] 2.2 Conversation Page
- [x] 2.3 Conversations Dashboard
✓ Build: PASSING

### PHASE 3: ✅ COMPLETE
- [x] 3.1 Quick Send Component (integrated in chat)
- [x] 3.2 Standing Order Modal (integrated in chat)
- [x] 3.3 Standing Order API
✓ Build: PASSING

### PHASE 4: ⏳ IN PROGRESS
- [ ] 4.1 Redesign TODAY page (add WhatsApp section at top)
- [ ] 4.2 WhatsApp metrics widget

### PHASE 5: ⏳ PENDING
- [ ] 5.1 Connect to psychology framework
- [ ] 5.2 Database schema update
- [ ] 5.3 Remove campaign builder

### PHASE 6: ⏳ PENDING
- [ ] 6.1 Test WhatsApp send flow
- [ ] 6.2 Test standing order creation
- [ ] 6.3 Test TODAY page
- [ ] 6.4 Test aesthetic/design

### PHASE 7: ⏳ PENDING
- [ ] 7.1 Configure WhatsApp API
- [ ] 7.2-7.5 First live send

