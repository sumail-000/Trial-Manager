# Quick Reference Guide - User Feedback & Error Handling

## 🎯 Quick Usage Guide

### Toast Notifications

```typescript
import { useToast } from "@/components/ui";

const MyComponent = () => {
  const toast = useToast();
  
  // Usage
  toast.success("Operation completed!");
  toast.error("Something went wrong");
  toast.warning("Please be careful");
  toast.info("Did you know...");
  
  // Custom duration (milliseconds)
  toast.success("Quick message", 2000);
  toast.error("Important error", 10000);
};
```

### Loading Spinner

```typescript
import { LoadingSpinner } from "@/components/ui";

<LoadingSpinner size="md" text="Loading..." />
<LoadingSpinner size="sm" />
<LoadingSpinner size="lg" text="Please wait..." />
```

### Error Boundary

```typescript
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

## 🎨 Toast Colors & Icons

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| `success` | Green | ✓ CheckCircle | Successful operations |
| `error` | Red | ⚠ AlertCircle | Errors & failures |
| `warning` | Yellow | ⚠️ AlertTriangle | Warnings & cautions |
| `info` | Cyan | ℹ Info | Informational messages |

---

## 🔄 Common Patterns

### Form Submission with Feedback

```typescript
const [isLoading, setIsLoading] = useState(false);
const toast = useToast();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    await yourAction();
    toast.success("Successfully saved!");
    // Reset form or navigate
  } catch (error: any) {
    toast.error(error?.message || "Failed to save");
  } finally {
    setIsLoading(false);
  }
};
```

### Delete with Confirmation

```typescript
const handleDelete = async (id: string, name: string) => {
  if (!confirm(`Delete ${name}?`)) return;
  
  try {
    await deleteAction(id);
    toast.success(`${name} deleted successfully`);
  } catch (error: any) {
    toast.error(error?.message || "Failed to delete");
  }
};
```

### Protected Action

```typescript
const { isAuthenticated } = useAuth();
const toast = useToast();
const router = useRouter();

const handleProtectedAction = () => {
  if (!isAuthenticated) {
    toast.warning("Please sign in to continue");
    router.push("/login");
    return;
  }
  
  // Proceed with action
};
```

---

## 📡 API Response Format

### Success Response
```json
{
  "data": { /* your data */ },
  "success": true
}
```

### Error Response
```json
{
  "error": "User-friendly error message",
  "success": false
}
```

### HTTP Status Codes
- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## 🎭 User Flow Examples

### Login Flow
```
1. Visit /dashboard (not authenticated)
2. → Redirect to /login?redirect=/dashboard&message=unauthenticated
3. → Toast: "Please sign in to continue"
4. Enter credentials
5. → Success: Toast "Welcome back! Signed in successfully"
6. → Redirect to /dashboard
```

### Create Trial Flow
```
1. Fill form
2. Click "Add Trial"
3. → Button text: "Creating Trial..."
4. → Button disabled
5. → Success: Toast "Trial for Netflix created successfully!"
6. → Form resets
7. → Button enabled again
```

### Delete Trial Flow
```
1. Click "Delete" button
2. → Button text: "Deleting..."
3. → Button disabled
4. → Success: Toast "Trial for Netflix deleted successfully"
5. → Item removed from list
```

---

## 🛠️ Troubleshooting

### Toast Not Showing?
- ✅ Check `ToastProvider` is in `AppProviders`
- ✅ Import from `@/components/ui`
- ✅ Call inside a React component (not outside)

### Redirect Not Working?
- ✅ Check `ProtectedRoute` wraps your component
- ✅ Verify auth state in `useAuth()`
- ✅ Check browser console for errors

### Loading State Stuck?
- ✅ Ensure `finally` block resets loading state
- ✅ Check for unhandled promise rejections
- ✅ Add error boundaries around components

---

## 🎨 Styling Toast Colors

All colors follow your existing pixel theme:

```css
/* Already configured in tailwind.config.ts */
accent-success → var(--color-accent-positive) → #8df5b6 (dark) / #16a34a (light)
accent-warning → var(--color-accent-warning) → #f7d774 (dark) / #ca8a04 (light)
accent-danger → var(--color-accent-danger) → #ff5f82 (dark) / #dc2626 (light)
accent-primary → var(--color-accent-primary) → #6fdcff (dark) / #1e88e5 (light)
```

---

## ⚡ Performance Tips

1. **Toast Duration:** Default 5s, use shorter for simple messages
2. **Loading States:** Always use for operations > 300ms
3. **Error Boundaries:** Wrap large component trees, not individual components
4. **Debounce:** Consider debouncing form validation

---

## 🧪 Testing Checklist

**Authentication:**
- [ ] Wrong credentials → Error toast
- [ ] Successful login → Success toast + redirect
- [ ] Protected route → Redirect + warning
- [ ] Logout → Success toast

**Forms:**
- [ ] Invalid input → Error toast + inline error
- [ ] Valid submission → Success toast
- [ ] Loading state during submit
- [ ] Form disabled during submit

**CRUD Operations:**
- [ ] Create → Success toast + item appears
- [ ] Delete → Success toast + item disappears
- [ ] Update → Success toast + item updates
- [ ] Error → Error toast + item unchanged

---

## 📞 Need Help?

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Toast doesn't show | Check ToastProvider in app tree |
| Redirect loop | Check auth logic in ProtectedRoute |
| Form submits multiple times | Add loading state + disable button |
| Error boundary not catching | Errors must be thrown during render |
| Loading spinner off-center | Add flex container with center alignment |

---

## 🚀 Best Practices

### DO ✅
- Use specific error messages
- Show loading states for async operations
- Provide success feedback for all actions
- Use appropriate toast types
- Handle network errors gracefully
- Reset form on success only
- Log errors to console for debugging

### DON'T ❌
- Show generic "Error occurred" messages
- Submit without loading state
- Leave user wondering if action completed
- Use wrong toast type (error for warning, etc.)
- Ignore errors silently
- Reset form before operation completes
- Expose internal error details to users

---

## 📚 Component Reference

### Toast Hook
```typescript
const toast = useToast();

// Methods
toast.success(message: string, duration?: number)
toast.error(message: string, duration?: number)
toast.warning(message: string, duration?: number)
toast.info(message: string, duration?: number)
toast.showToast(message: string, type: ToastType, duration?: number)
```

### Loading Spinner Props
```typescript
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}
```

### Error Boundary Props
```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}
```

---

This guide covers all the essential patterns you'll need. For detailed implementation notes, see `USER_EXPERIENCE_IMPROVEMENTS.md`.

