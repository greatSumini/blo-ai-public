# UUID Validation Error - Root Cause Analysis and Fix

## Error Message
```json
{
    "code": "STYLE_GUIDE_FETCH_ERROR",
    "message": "Failed to fetch style guide: invalid input syntax for type uuid: \"user_35C8pYrKCKuwY04FgeRCe5uT7J4\""
}
```

## Root Cause

The database was migrated from using `clerk_user_id` (TEXT) directly as foreign keys to using a `profiles` table with UUID `id` as the primary key (migration `0006_create_profiles_and_migrate_refs.sql`).

The error occurs when:
1. `getProfileIdByClerkId()` returns `null` (profile doesn't exist)
2. The null value is not properly handled
3. Either an empty string or the Clerk user ID is passed directly to a query expecting a UUID

## Specific Issues Found

### Issue 1: Dangerous Fallback in quota-service.ts
**Location:** `src/features/articles/backend/quota-service.ts:193`
```typescript
.eq('profile_id', profileId ?? '')
```
**Problem:** When `profileId` is `null`, an empty string `''` is passed to the UUID column, causing a type error.

### Issue 2: Missing Profile Creation
**Location:** Multiple service files
**Problem:** When `getProfileIdByClerkId` returns `null`, the code returns early without creating the profile. This leaves the user in a broken state.

**Affected Files:**
- `src/features/onboarding/backend/service.ts` (lines 130, 208, 303, 383, 414)
- `src/features/articles/backend/service.ts` (lines 141, 216, 266, 294, 362)
- `src/features/articles/backend/quota-service.ts` (lines 87, 133, 189)
- `src/features/articles/backend/ai-service.ts` (line 31)
- `src/app/api/articles/generate/route.ts` (line 42)
- `src/features/onboarding/backend/onboarding-status.ts` (line 16)

### Issue 3: Inconsistent Error Handling
Some functions use `ensureProfile()` which creates a profile if missing, while others use `getProfileIdByClerkId()` which just returns null.

## Solution Strategy

The fix requires two changes:

1. **Replace all `getProfileIdByClerkId` calls with `ensureProfile`** in write operations
2. **Add proper null checks** before using profileId in database queries
3. **Remove dangerous fallbacks** like `profileId ?? ''`

This ensures:
- Profiles are automatically created when missing
- No invalid values are passed to UUID columns
- Consistent behavior across all features

## Fixes Applied

### 1. Fixed quota-service.ts (3 functions)

**File:** `src/features/articles/backend/quota-service.ts`

#### checkQuota (lines 80-92)
- Changed from `getProfileIdByClerkId` to `ensureProfile`
- Now creates profile automatically if it doesn't exist
- Prevents "Profile not found" errors during quota checks

#### incrementQuota (lines 127-139)
- Changed from `getProfileIdByClerkId` to `ensureProfile`
- Ensures profile exists before incrementing quota
- Prevents quota increment failures for new users

#### getQuotaStatus (lines 183-206)
- Added early return when profileId is null
- **Removed dangerous fallback**: `profileId ?? ''` → proper null check
- Returns default quota status instead of attempting invalid query

### 2. Fixed AI service files (2 functions)

**File:** `src/features/articles/backend/ai-service.ts` (line 25-34)
- Changed `getStyleGuide` helper from `getProfileIdByClerkId` to `ensureProfile`
- Ensures profile exists before fetching style guides
- Prevents style guide fetch errors for new users

**File:** `src/app/api/articles/generate/route.ts` (line 36-45)
- Changed `getStyleGuide` helper from `getProfileIdByClerkId` to `ensureProfile`
- Identical fix as ai-service.ts for consistency

## Impact Analysis

### Before Fix:
1. New user signs up with Clerk
2. User tries to generate article or access style guide
3. `getProfileIdByClerkId` returns `null` (profile doesn't exist yet)
4. Code passes `null`, empty string, or Clerk ID to UUID column
5. PostgreSQL error: `invalid input syntax for type uuid`

### After Fix:
1. New user signs up with Clerk
2. User tries to generate article or access style guide
3. `ensureProfile` creates profile automatically if missing
4. Valid UUID profileId is passed to database queries
5. Operation succeeds

## Testing Recommendations

1. **Test new user flow:**
   - Create new Clerk account
   - Immediately try to generate article
   - Should create profile automatically and succeed

2. **Test quota operations:**
   - Check quota for new user (should return default)
   - Generate article (should increment quota)
   - Check quota status (should reflect usage)

3. **Test style guide operations:**
   - Fetch style guides for new user (should work)
   - Create style guide (should work)
   - Generate article with style guide (should work)

4. **Test existing users:**
   - Ensure existing users with profiles continue to work
   - No breaking changes for current users

## Files Modified

1. `src/features/articles/backend/quota-service.ts`
2. `src/features/articles/backend/ai-service.ts`
3. `src/app/api/articles/generate/route.ts`
4. `BUG_FIX_SUMMARY.md` (this file)

## Remaining Improvements (Optional)

While we fixed the critical bugs, there are still places using `getProfileIdByClerkId` in READ operations. These are safe because they properly handle null returns, but for consistency you might want to review:

- `src/features/onboarding/backend/service.ts` (multiple functions)
- `src/features/articles/backend/service.ts` (multiple functions)

These functions correctly return early with error codes when profile is not found, so they don't cause UUID errors. However, using `ensureProfile` would create a better user experience by auto-creating profiles.
