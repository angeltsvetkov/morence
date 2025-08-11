# Admin Authentication Setup

This project uses role-based authentication for the admin panel. Here's how to set it up:

## Environment Variables

Copy the `.env.example` file to `.env` and configure the required variables:

```bash
cp .env.example .env
```

Then edit `.env` and set:

```
VITE_SUPER_ADMIN_ID=your_firebase_user_id_here
```

Replace `your_firebase_user_id_here` with the actual Firebase UID of the user who should have super admin privileges.

## How to Find Your Firebase UID

1. Sign in to your Firebase console
2. Go to Authentication > Users
3. Find your user account and copy the UID

Alternatively, you can temporarily log the user ID in the console:

```javascript
// Temporary code to log your user ID
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Your Firebase UID:', user.uid);
  }
});
```

## Access Levels

### Super Admin
- Can view and edit all apartments
- Has access to migration tools
- Can manage all system settings
- Has full navigation sidebar with all sections
- Can manage places (interesting places)
- User ID must match `VITE_SUPER_ADMIN_ID`

### Regular Admin
- Can only view and edit apartments they created
- Cannot access migration tools
- Limited to their own apartment data
- No sidebar navigation (streamlined interface)
- Cannot access places or settings sections
- Redirected to apartments page automatically

## Migration

After setting up the environment variables, run the apartment ownership migration:

1. Sign in as the super admin user
2. Go to Admin > Settings
3. Find the "Migration Tools" section
4. Click "Migrate Apartment Ownership"

This will assign ownership of all existing apartments to the super admin user.

## User Interface Differences

### Super Admin Interface
- Full sidebar navigation with all sections (Apartments, Places, Settings)
- Can access all admin features
- Migration tools available in Settings

### Regular Admin Interface
- No sidebar navigation (cleaner, simplified interface)
- Header bar with "Your Apartments" title and Sign Out button
- Only apartment management features available
- Automatic redirection if trying to access restricted pages

## Security Notes

- The `.env` file is gitignored and should never be committed
- Environment variables are still visible in the client-side bundle
- For production, consider implementing server-side role checks
- The super admin ID should be kept secure and only shared with trusted users
