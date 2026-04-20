# 🏗️ Admin Panel Development Reference

## Quick File Navigation

### Core Admin Pages (Completed)
- [Dashboard Page](src/app/features/admin/pages/dashboard/dashboard.ts) - Aggregated metrics display
- [Academic Terms](src/app/features/admin/pages/academic-terms/academic-terms.ts) - CRUD for academic terms
- [Fee Structures](src/app/features/admin/pages/fee-structures/fee-structures.ts) - CRUD for fees
- [Enrollments](src/app/features/admin/pages/enrollment/enrollment.ts) - CRUD for enrollments
- [Invoices](src/app/features/admin/pages/invoices/invoices.ts) - CRUD for invoices
- [Payments](src/app/features/admin/pages/payment/payment.ts) - CRUD for payments
- [Refunds](src/app/features/admin/pages/refunds/refunds.ts) - CRUD for refunds

### Services (20 Total)
**Base Services:**
- [AdminEndpointService](src/app/features/admin/services/admin-resource.service.ts) - Base URL construction
- [AdminReadService](src/app/features/admin/services/admin-resource.service.ts) - Read operations
- [AdminCrudService](src/app/features/admin/services/admin-resource.service.ts) - Full CRUD operations

**Entity Services (all extend AdminCrudService):**
- AcademicTermService
- FeeStructuresService
- EnrollmentsService
- InvoicesService
- PaymentsService
- RefundsService
- StudentsService
- AssessmentsService
- ProgramsService
- SubjectsService
- TeachersService
- And more...

### Modals (15 Total)
**Academic Terms:**
- [Add Modal](src/app/features/admin/modals/academic-terms/add-academic-terms/add-academic-terms.modal.ts)
- [Update Modal](src/app/features/admin/modals/academic-terms/update-academic-terms/update-academic-terms.modal.ts)
- [Delete Modal](src/app/features/admin/modals/academic-terms/delete-academic-terms/delete-academic-terms.modal.ts)

**Invoices:**
- [Add Modal](src/app/features/admin/modals/invoices/add-invoice/add-invoice.modal.ts)
- [Update Modal](src/app/features/admin/modals/invoices/update-invoice/update-invoice.modal.ts)
- [Delete Modal](src/app/features/admin/modals/invoices/delete-invoice/delete-invoice.modal.ts)

*Same pattern for: Fee Structures, Enrollments, Payments, Refunds*

---

## 📝 How to Add a New Admin Page

### Step 1: Create Service
```typescript
// src/app/features/admin/services/my-resource.service.ts
@Injectable({ providedIn: 'root' })
export class MyResourceService extends AdminCrudService<MyResource, CreatePayload, UpdatePayload> {
  constructor() { super('my-resources'); }
  // Auto-generates endpoints: /api/admin/my-resources
}
```

### Step 2: Create Component
```typescript
// src/app/features/admin/pages/my-resource/my-resource.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyResourceService, MyResource } from '../../../../shared/services/my-resource.service';
import { AddMyResourceModalComponent } from '../../modals/my-resource/add-my-resource/add-my-resource.modal';
import { UpdateMyResourceModalComponent } from '../../modals/my-resource/update-my-resource/update-my-resource.modal';
import { DeleteMyResourceModalComponent } from '../../modals/my-resource/delete-my-resource/delete-my-resource.modal';

@Component({
  selector: 'app-my-resource',
  standalone: true,
  imports: [CommonModule, FormsModule, AddMyResourceModalComponent, UpdateMyResourceModalComponent, DeleteMyResourceModalComponent],
  templateUrl: './my-resource.html',
})
export class MyResource implements OnInit {
  resources: MyResource[] = [];
  isLoading = true;
  errorMessage = '';
  searchQuery = '';

  @ViewChild(AddMyResourceModalComponent) addModal!: AddMyResourceModalComponent;
  @ViewChild(UpdateMyResourceModalComponent) updateModal!: UpdateMyResourceModalComponent;
  @ViewChild(DeleteMyResourceModalComponent) deleteModal!: DeleteMyResourceModalComponent;

  constructor(private resourceService: MyResourceService) {}

  ngOnInit() {
    this.loadResources();
  }

  loadResources() {
    this.isLoading = true;
    this.resourceService.list().subscribe({
      next: (data) => {
        this.resources = Array.isArray(data) ? data : data.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load resources';
        this.isLoading = false;
      }
    });
  }

  getFilteredResources() {
    if (!this.searchQuery) return this.resources;
    const query = this.searchQuery.toLowerCase();
    return this.resources.filter(r => 
      JSON.stringify(r).toLowerCase().includes(query)
    );
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(resource: MyResource) {
    this.updateModal.open(resource);
  }

  openDeleteModal(id: number) {
    this.deleteModal.open(id);
  }
}
```

### Step 3: Create Template
```html
<!-- src/app/features/admin/pages/my-resource/my-resource.html -->
<div class="p-8">
  <div class="flex justify-between mb-8">
    <h1 class="text-3xl font-bold">My Resources</h1>
    <button (click)="openAddModal()" class="px-4 py-2 bg-blue-600 text-white rounded">
      + Add Resource
    </button>
  </div>

  <!-- Search -->
  <input [(ngModel)]="searchQuery" placeholder="Search..." class="w-full mb-4 p-2 border rounded">

  <!-- Loading -->
  <div *ngIf="isLoading" class="text-center py-8">Loading...</div>

  <!-- Error -->
  <div *ngIf="errorMessage" class="text-red-600 mb-4">{{ errorMessage }}</div>

  <!-- Table -->
  <table *ngIf="!isLoading" class="w-full border">
    <thead>
      <tr class="bg-gray-100">
        <th class="p-2 text-left">ID</th>
        <th class="p-2 text-left">Name</th>
        <th class="p-2 text-left">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let resource of getFilteredResources()">
        <td class="p-2 border">{{ resource.id }}</td>
        <td class="p-2 border">{{ resource.name }}</td>
        <td class="p-2 border">
          <button (click)="openUpdateModal(resource)" class="text-blue-600 mr-4">Edit</button>
          <button (click)="openDeleteModal(resource.id)" class="text-red-600">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Modals -->
<app-add-my-resource-modal (refresh)="loadResources()"></app-add-my-resource-modal>
<app-update-my-resource-modal (refresh)="loadResources()"></app-update-my-resource-modal>
<app-delete-my-resource-modal (refresh)="loadResources()"></app-delete-my-resource-modal>
```

### Step 4: Create Modals (3 variants)
```typescript
// src/app/features/admin/modals/my-resource/add-my-resource/add-my-resource.modal.ts
@Component({
  selector: 'app-add-my-resource-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-my-resource.modal.html',
  styleUrls: ['./add-my-resource.modal.css']
})
export class AddMyResourceModalComponent {
  @Output() refresh = new EventEmitter<void>();
  
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  form: Partial<MyResource> = {};

  constructor(private resourceService: MyResourceService) {}

  open() {
    this.isOpen = true;
    this.resetForm();
  }

  close() {
    this.isOpen = false;
  }

  resetForm() {
    this.form = {};
    this.errorMessage = '';
  }

  submit() {
    if (!this.validate()) return;
    
    this.isLoading = true;
    this.resourceService.create(this.form as MyResource).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create resource';
      }
    });
  }

  validate(): boolean {
    // Add validation logic
    return true;
  }
}
```

### Step 5: Add to Routes
```typescript
// src/app/features/admin/admin.route.ts
{
  path: 'my-resources',
  loadComponent: () =>
    import('./pages/my-resource/my-resource').then(m => m.MyResource)
}
```

---

## 🔄 How to Add a New Admin Service

### Quick Template
```typescript
// src/app/features/admin/services/my-resource.service.ts
import { Injectable } from '@angular/core';
import { AdminCrudService } from './admin-resource.service';

export interface MyResource {
  id?: number;
  field1: string;
  field2: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMyResourcePayload {
  field1: string;
  field2: number;
}

export interface UpdateMyResourcePayload {
  field1?: string;
  field2?: number;
}

@Injectable({ providedIn: 'root' })
export class MyResourceService extends AdminCrudService<MyResource, CreateMyResourcePayload, UpdateMyResourcePayload> {
  constructor() {
    super('my-resources'); // Maps to /api/admin/my-resources
  }

  // Optional: Add custom methods
  customSearch(query: string) {
    return this.http.get<MyResource[]>(
      `${this.collectionUrl()}/search?q=${query}`
    );
  }
}
```

---

## 🎨 Tailwind CSS Cheat Sheet

### Common Classes Used in Admin Panel
```css
/* Spacing */
p-4 = padding: 1rem
m-4 = margin: 1rem
gap-4 = gap: 1rem

/* Grid */
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 = Responsive grid

/* Colors */
bg-blue-600 = Blue background (primary)
text-slate-900 = Dark text
border border-slate-200 = Light border

/* Typography */
text-3xl font-bold = Large bold text
text-sm text-slate-500 = Small gray text

/* Utilities */
rounded-lg = Rounded corners
shadow-sm = Subtle shadow
hover:bg-slate-50 = Hover effect
transition-all = Smooth transitions
flex justify-between items-center = Flexbox layout
```

---

## 🔐 Authentication & Security

### Token Interceptor
All requests automatically include:
```
Authorization: Bearer {sanctum_token}
```

### Protected Routes
Admin routes require `auth.guard.ts` - checks if user is authenticated before allowing access.

### CORS Configuration
Backend must allow:
```
SANCTUM_STATEFUL_DOMAINS=localhost:4200
```

---

## 🧪 Testing Patterns

### Component Test Template
```typescript
describe('MyResourceComponent', () => {
  let component: MyResource;
  let fixture: ComponentFixture<MyResource>;
  let service: MyResourceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyResource],
      providers: [MyResourceService]
    }).compileComponents();

    fixture = TestBed.createComponent(MyResource);
    component = fixture.componentInstance;
    service = TestBed.inject(MyResourceService);
    fixture.detectChanges();
  });

  it('should load resources on init', () => {
    spyOn(service, 'list').and.returnValue(of([]));
    component.ngOnInit();
    expect(service.list).toHaveBeenCalled();
  });
});
```

---

## 🚨 Common Errors & Solutions

### Error: "Cannot read property 'id' of undefined"
**Cause:** Data not loaded yet when template tries to display
**Fix:** Add `*ngIf="!isLoading && data"` to template

### Error: "401 Unauthorized"
**Cause:** Token missing or expired
**Fix:** Re-authenticate, check token interceptor

### Error: "Cannot POST /api/my-resources"
**Cause:** Endpoint doesn't use `/admin/` prefix
**Fix:** Verify service extends AdminCrudService and calls `super('my-resources')`

### Error: Modal content not visible
**Cause:** Modal z-index issues or backdrop styling
**Fix:** Ensure modal has higher z-index, use Tailwind's `fixed` positioning

---

## 📚 Key Concepts

### AdminCrudService Pattern
Provides automatic CRUD endpoints by extending the base class and passing resource name:
```typescript
super('invoices') // Generates /api/admin/invoices endpoints
```

### Observable Data Flow
```
Component ngOnInit
    ↓
Service.list() (HTTP GET request)
    ↓
Subscribe to Observable
    ↓
next: Store in component property
error: Set errorMessage
    ↓
Template *ngIf renders data
    ↓
User interaction triggers Modal
    ↓
Modal calls Service.create/update/delete
    ↓
Component calls loadResources() to refresh
```

### Modal Lifecycle
```
open() → Clear form → Set isOpen=true → Display modal
User fills form
submit() → Validate → API call → Subscribe to result
success → emit refresh → close() → Reset form
error → Show error message → User can retry
```

---

## ✅ Pre-Deployment Checklist

- [ ] All services extend AdminCrudService or AdminEndpointService
- [ ] All endpoints verified in Network tab with `/api/admin/` prefix
- [ ] All pages have loading states
- [ ] All pages have error messages
- [ ] All modals have form validation
- [ ] Responsive design tested on mobile/tablet/desktop
- [ ] Build passes: `ng build --configuration development`
- [ ] No console errors when navigating all pages
- [ ] CRUD operations tested (create, read, update, delete)
- [ ] Error scenarios tested (network down, 401, etc.)

---

## 🔗 Related Files
- [Admin Routes](src/app/features/admin/admin.route.ts)
- [Admin Layout](src/app/layouts/admin-layout/admin-layout.component.ts)
- [Error Handler Service](src/app/shared/services/error-handler.service.ts)
- [Auth Guard](src/app/core/guards/auth.guard.ts)
- [Token Interceptor](src/app/core/interceptors/token.interceptor.ts)
- [Environment Config](src/environments/environment.ts)
