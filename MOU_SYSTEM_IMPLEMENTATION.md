# MoU Submission System Implementation Summary

## Overview
Implemented a complete MoU (Memorandum of Understanding) submission and approval system with digital signatures using Privy's embedded wallets.

## Features Implemented

### 1. Backend Components

#### **Models** (`backend/models/MoU.js`)
- Complete MoU schema with signature tracking
- Recipients flow management
- Stage-based approval workflow
- Document hash verification
- Methods for signature validation and workflow progression

#### **Controllers** (`backend/controllers/mou.controller.js`)
- `submitMoU`: Council members submit MoUs with digital signature
- `getMySubmittedMoUs`: Council members view their submissions
- `getPendingMoUs`: Faculty/Admin view MoUs awaiting their signature
- `getAllMoUs`: View all MoUs with filters
- `getMoUById`: View single MoU details
- `signMoU`: Sign and approve MoU with ECDSA signature
- `rejectMoU`: Reject MoU with reason
- `verifySignature`: Verify digital signatures

#### **Routes** (`backend/routes/mou.routes.js`)
- POST `/api/mou/submit` - Submit new MoU (Council/Admin)
- GET `/api/mou/my-submissions` - Get council's submissions
- GET `/api/mou/pending` - Get pending MoUs for signature (Faculty/Admin)
- GET `/api/mou/all` - Get all MoUs with filters
- GET `/api/mou/:id` - Get single MoU
- POST `/api/mou/:id/sign` - Sign MoU
- POST `/api/mou/:id/reject` - Reject MoU
- GET `/api/mou/:mouId/verify/:signatureIndex` - Verify signature

### 2. Frontend Components

#### **MoU Submission Form** (`src/components/council/MOUAdditionForm.js`)
Simplified 3-field form for council members:
1. **MoU Title** - Descriptive title for the MoU
2. **Upload Document** - PDF file upload (max 10MB)
3. **Recipients Flow** - Ordered list of approvers

**Features:**
- PDF validation (type and size)
- Document hash calculation (SHA-256)
- Digital signature using Privy embedded wallet
- Recipients ordering (add, remove, reorder)
- Email validation
- Real-time status updates during submission

**Digital Signature Flow:**
1. User uploads PDF
2. System calculates SHA-256 hash of document
3. Creates signature message with document hash
4. Signs message using Privy embedded wallet (ECDSA)
5. Stores signature, wallet address, and document hash

### 3. API Client Updates

Added MoU endpoints to `src/utils/apiClient.js`:
- `submitMoU(formData)`
- `getMySubmittedMoUs()`
- `getPendingMoUs()`
- `getAllMoUs(filters)`
- `getMoUById(mouId)`
- `signMoU(mouId, signatureData)`
- `rejectMoU(mouId, reason)`
- `verifySignature(mouId, signatureIndex)`

### 4. Database Schema

```javascript
MoU Schema:
{
  title: String,
  document: {
    url, path, publicId, filename, hash, size
  },
  submittedBy: {
    userId, email, name
  },
  recipientsFlow: [{
    email, name, role, order
  }],
  signatures: [{
    signerEmail, signerName, signerRole,
    signature, walletAddress, signedAt, documentHash
  }],
  currentStage: Number,
  status: enum['pending', 'in_progress', 'approved', 'rejected', 'completed'],
  rejectionReason: { rejectedBy, reason, rejectedAt },
  metadata: { totalStages, completedStages, isComplete }
}
```

## Workflow

### Submission Flow (Council Member)
1. Fill in MoU title
2. Upload PDF document
3. Add recipients in order (faculty → faculty → ... → admin)
4. System calculates document hash
5. Sign with Privy embedded wallet
6. Submit to backend
7. MoU status changes to 'in_progress'

### Approval Flow (Faculty/Admin)
1. Receive notification (MoU appears in pending list)
2. View MoU details and previous signatures
3. Verify document integrity (hash check)
4. Sign with Privy embedded wallet
5. Submit signature
6. MoU advances to next recipient
7. When all sign, status changes to 'completed'

## Security Features

1. **Document Integrity**
   - SHA-256 hash calculated on upload
   - Hash verified at each signature step
   - Prevents document tampering

2. **Digital Signatures**
   - ECDSA signatures using Privy embedded wallets
   - Each signature includes:
     - Signer's email and name
     - Wallet address
     - Timestamp
     - Document hash at time of signing

3. **Workflow Control**
   - Sequential approval (can't skip stages)
   - Each recipient must sign in order
   - Rejection stops the workflow

4. **Authorization**
   - Role-based access control
   - Only current recipient can sign
   - Council can submit, Faculty/Admin can approve

## Dependencies Added

- `crypto-js` - For SHA-256 hashing on frontend
- Uses existing Privy SDK for wallet signing

## Next Steps

To complete the implementation, create:

1. **MoU Status Page** (`src/components/council/MOUStatus.js`)
   - View all submitted MoUs
   - Track approval progress
   - See signatures and status

2. **MoU Approval Page** (`src/components/faculty/FacultyMOUApproval.js`)
   - View pending MoUs
   - Sign documents
   - Reject with reason

3. **Admin MoU Management** (`src/components/admin/AdminMOUApproval.js`)
   - Same as faculty page
   - Final approver in the chain

4. **MoU Viewer Component**
   - Display PDF
   - Show signature chain
   - Verify signatures

## Usage Example

```javascript
// Council submits MoU
const formData = new FormData();
formData.append("title", "Partnership with XYZ University");
formData.append("document", pdfFile);
formData.append("recipientsFlow", JSON.stringify([
  { email: "faculty1@lnmiit.ac.in", order: 0 },
  { email: "faculty2@lnmiit.ac.in", order: 1 },
  { email: "admin@lnmiit.ac.in", order: 2 }
]));
formData.append("initialSignature", signature);
formData.append("walletAddress", walletAddress);
formData.append("documentHash", hash);

await api.mou.submitMoU(formData);
```

```javascript
// Faculty signs MoU
await api.mou.signMoU(mouId, {
  signature: signatureHex,
  walletAddress: facultyWalletAddress,
  documentHash: documentHash
});
```

## Testing

1. Start backend: `cd backend && npm start`
2. Start frontend: `npm start`
3. Login as council member
4. Navigate to "MoU Addition" from dashboard
5. Fill form and submit
6. Login as faculty (first recipient)
7. View pending MoUs
8. Sign document
9. Repeat for each recipient

## Notes

- All signatures are stored on-chain-like (in MongoDB with wallet addresses)
- Document hash ensures integrity across the approval chain
- Privy embedded wallets provide secure ECDSA signatures
- No external blockchain needed - signatures are verifiable using standard crypto libraries
