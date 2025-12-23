# Apartment Edit Components

This directory contains decomposed components for the apartment editing functionality, making the codebase more maintainable and modular.

## Components Overview

### Tab Components

#### 1. `ApartmentDetailsTab`
Handles apartment basic information:
- Apartment name/title (multilingual)
- Description (multilingual)
- Floor number
- Location and address (multilingual)
- Hide name option
- Availability period settings

**Props:**
```typescript
interface ApartmentDetailsTabProps {
    currentApartmentData: ApartmentData;
    setCurrentApartmentData: React.Dispatch<React.SetStateAction<ApartmentData>>;
    formLanguage: 'bg' | 'en';
    setFormLanguage: (lang: 'bg' | 'en') => void;
    loading: boolean;
    handleNameChange: (lang: 'bg' | 'en', value: string) => void;
}
```

#### 2. `ApartmentAmenitiesTab`
Manages apartment amenities:
- Predefined amenities selection
- Custom amenities creation
- Drag-and-drop reordering
- Multilingual amenity management

**Props:**
```typescript
interface ApartmentAmenitiesTabProps {
    // Base props + amenity-specific handlers
    availableAmenities: Amenity[];
    handleAmenityToggle: (amenityKey: string) => void;
    handleCustomAmenityAdd: (value: string) => void;
    handleAmenityRemove: (amenity: string) => void;
    handleAmenitiesOnDragEnd: (result: DropResult) => void;
    getAmenityTranslation: (amenity: string) => string;
    renderAmenityIcon: (amenity: string) => React.ReactNode;
}
```

#### 3. `ApartmentGalleryTab`
Photo gallery management:
- Photo upload
- Drag-and-drop reordering
- Hero image selection
- Favorite images management
- Photo deletion

**Props:**
```typescript
interface ApartmentGalleryTabProps {
    // Base props + gallery-specific handlers
    galleryItems: GalleryItem[];
    setGalleryItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
    handleOnDragEnd: (result: DropResult) => void;
    handleSetHeroImage: (url: string) => void;
    handleToggleFavouriteImage: (url: string) => void;
    handleImageDelete: (id: string) => void;
}
```

#### 4. `ApartmentPricingTab`
Pricing and offers management:
- Base price setting (EUR)
- Special offers management
- Dual currency support
- Price calculation helpers

**Props:**
```typescript
interface ApartmentPricingTabProps {
    // Base props + pricing-specific handlers
    handleAddBasePrice: () => void;
    handleEditBasePrice: () => void;
    handleDeleteBasePrice: () => void;
    handleEditPricingOffer: (offer: any) => void;
    handleDeletePricingOffer: (offerId: string) => void;
    setIsPricingOfferModalOpen: (open: boolean) => void;
    convertEurToBgn: (eur: number) => number;
}
```

#### 5. `ApartmentShareTab`
Sharing functionality:
- URL generation and display
- Copy to clipboard
- Share button functionality

**Props:**
```typescript
interface ApartmentShareTabProps {
    slug: string;
    handleShare: () => void;
    handleCopyUrl: () => void;
}
```

## Usage Example

```typescript
import {
    ApartmentDetailsTab,
    ApartmentAmenitiesTab,
    ApartmentGalleryTab,
    ApartmentPricingTab,
    ApartmentShareTab
} from './components/admin/apartment-edit';

const ApartmentEditAdmin = () => {
    const [view, setView] = useState('details');
    // ... other state and handlers

    return (
        <div>
            {/* Tab Navigation */}
            <div className="flex border-b mb-4">
                <button onClick={() => setView('details')}>Details</button>
                <button onClick={() => setView('amenities')}>Amenities</button>
                <button onClick={() => setView('gallery')}>Gallery</button>
                <button onClick={() => setView('pricing')}>Pricing</button>
                <button onClick={() => setView('share')}>Share</button>
            </div>

            {/* Tab Content */}
            {view === 'details' && (
                <ApartmentDetailsTab
                    currentApartmentData={currentApartmentData}
                    setCurrentApartmentData={setCurrentApartmentData}
                    formLanguage={formLanguage}
                    setFormLanguage={setFormLanguage}
                    loading={loading}
                    handleNameChange={handleNameChange}
                />
            )}

            {view === 'amenities' && (
                <ApartmentAmenitiesTab
                    currentApartmentData={currentApartmentData}
                    setCurrentApartmentData={setCurrentApartmentData}
                    formLanguage={formLanguage}
                    setFormLanguage={setFormLanguage}
                    loading={loading}
                    availableAmenities={availableAmenities}
                    handleAmenityToggle={handleAmenityToggle}
                    handleCustomAmenityAdd={handleCustomAmenityAdd}
                    handleAmenityRemove={handleAmenityRemove}
                    handleAmenitiesOnDragEnd={handleAmenitiesOnDragEnd}
                    getAmenityTranslation={getAmenityTranslation}
                    renderAmenityIcon={renderAmenityIcon}
                />
            )}

            {/* ... other tabs */}
        </div>
    );
};
```

## Benefits

### 🎯 **Maintainability**
- Each tab is self-contained with clear responsibilities
- Easier to locate and fix bugs
- Simpler to add new features to specific tabs

### 🔄 **Reusability**
- Components can be used in other admin interfaces
- Easy to create apartment creation wizards
- Consistent UI patterns across the application

### 🧪 **Testing**
- Individual components can be unit tested in isolation
- Easier to mock dependencies for specific functionality
- Clear separation of concerns

### 👥 **Team Collaboration**
- Multiple developers can work on different tabs simultaneously
- Clear ownership boundaries for different features
- Consistent code structure across team members

### 📦 **Bundle Optimization**
- Code splitting opportunities for large tabs
- Lazy loading of complex components
- Better tree-shaking potential

## Future Improvements

### 1. **Calendar Tab Component**
- Extract the complex calendar and bookings functionality
- Separate components for calendar view and bookings table
- Better state management for booking operations

### 2. **Modal Components**
- Extract pricing offer modals
- Create reusable base price modal
- Standardize modal patterns

### 3. **State Management**
- Consider React Context for shared state
- Implement proper TypeScript interfaces
- Add validation schemas

### 4. **Error Handling**
- Consistent error boundaries
- Standardized error messages
- Better loading states

## Migration Strategy

1. **Gradual Replacement**: Replace one tab at a time
2. **Type Safety**: Ensure proper TypeScript interfaces
3. **Testing**: Add tests for each component
4. **Documentation**: Keep this README updated
5. **Cleanup**: Remove unused code from main component

## Notes

- All components use the admin language hook for translations
- Components follow the existing design patterns
- Drag-and-drop functionality is preserved where applicable
- State management remains in the parent component for now 