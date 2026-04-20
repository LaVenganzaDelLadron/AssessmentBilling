// ============================================================================
// MODAL COMPONENTS - Template Implementations
// ============================================================================

// Pattern for ALL Add/Update/Delete modals follows this structure:

// ============================================================================
// ADD MODAL TEMPLATE
// ============================================================================
/*
<div *ngIf="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div class="bg-white rounded-2xl shadow-xl max-w-md w-full">
    <div class="flex justify-between items-center p-6 border-b border-slate-200">
      <h2 class="text-xl font-bold">Add {{ EntityName }}</h2>
      <button (click)="close()" class="text-slate-500 hover:text-slate-700">×</button>
    </div>
    
    <form class="p-6 space-y-4">
      <!-- Form inputs populated with [(ngModel)]="form.fieldName" -->
      <!-- Example: <input [(ngModel)]="form.name" placeholder="Name" class="w-full px-3 py-2 border rounded"> -->
    </form>
    
    <div *ngIf="errorMessage" class="bg-red-50 text-red-700 p-3 mx-6 mb-4 rounded">
      {{ errorMessage }}
    </div>
    
    <div class="flex justify-end gap-3 p-6 border-t border-slate-200">
      <button (click)="close()" class="px-4 py-2 text-slate-700 border rounded hover:bg-slate-50">Cancel</button>
      <button (click)="submit()" [disabled]="isLoading" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        {{ isLoading ? 'Loading...' : 'Add' }}
      </button>
    </div>
  </div>
</div>
*/

// ============================================================================
// UPDATE MODAL TEMPLATE (identical to Add, just "Update" instead of "Add")
// ============================================================================

// ============================================================================
// DELETE MODAL TEMPLATE (simpler - just confirmation)
// ============================================================================
/*
<div *ngIf="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div class="bg-white rounded-2xl shadow-xl max-w-md w-full">
    <div class="p-6">
      <h2 class="text-xl font-bold text-red-600 mb-2">Delete Confirmation</h2>
      <p class="text-slate-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
    </div>
    
    <div *ngIf="errorMessage" class="bg-red-50 text-red-700 p-3 mx-6 mb-4 rounded">
      {{ errorMessage }}
    </div>
    
    <div class="flex justify-end gap-3 p-6 border-t border-slate-200">
      <button (click)="close()" class="px-4 py-2 text-slate-700 border rounded hover:bg-slate-50">Cancel</button>
      <button (click)="confirmDelete()" [disabled]="isLoading" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
        {{ isLoading ? 'Deleting...' : 'Delete' }}
      </button>
    </div>
  </div>
</div>
*/

// ============================================================================
// MODAL TYPESCRIPT COMPONENT TEMPLATES
// ============================================================================

// ADD MODAL PATTERN:
export class Add{{ Entity }}ModalComponent {
  @Output() refresh = new EventEmitter<void>();
  
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  
  form: Partial<{{ Entity }}> = {
    // Initialize fields
  };

  constructor(private service: {{ Entity }}Service) {}

  open() {
    this.isOpen = true;
    this.resetForm();
  }

  close() {
    this.isOpen = false;
  }

  resetForm() {
    this.form = { /* reset */ };
    this.errorMessage = '';
  }

  submit() {
    if (!this.validate()) return;
    
    this.isLoading = true;
    this.service.create(this.form as {{ Entity }}).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create';
      }
    });
  }

  validate(): boolean {
    // Add field validation
    return true;
  }
}

// UPDATE MODAL PATTERN:
export class Update{{ Entity }}ModalComponent {
  @Output() refresh = new EventEmitter<void>();
  
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  currentEntity: {{ Entity }} | null = null;
  form: Partial<{{ Entity }}> = {};

  constructor(private service: {{ Entity }}Service) {}

  open(entity: {{ Entity }}) {
    this.isOpen = true;
    this.currentEntity = entity;
    this.form = { ...entity };
    this.errorMessage = '';
  }

  close() {
    this.isOpen = false;
  }

  submit() {
    if (!this.currentEntity?.id || !this.validate()) return;
    
    this.isLoading = true;
    this.service.update(this.currentEntity.id, this.form as {{ Entity }}).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update';
      }
    });
  }

  validate(): boolean {
    return true;
  }
}

// DELETE MODAL PATTERN:
export class Delete{{ Entity }}ModalComponent {
  @Output() refresh = new EventEmitter<void>();
  
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  entityId: number | null = null;

  constructor(private service: {{ Entity }}Service) {}

  open(entity: {{ Entity }}) {
    this.isOpen = true;
    this.entityId = entity.id || null;
    this.errorMessage = '';
  }

  close() {
    this.isOpen = false;
  }

  confirmDelete() {
    if (!this.entityId) return;
    
    this.isLoading = true;
    this.service.delete(this.entityId).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to delete';
      }
    });
  }
}

// ============================================================================
// IMPLEMENTATION INSTRUCTIONS
// ============================================================================

/*
To complete all modals:

1. For each entity (assessment-breakdown, invoice-lines, official-receipts, 
   payment-allocations, payment-methods, programs, students, subjects, teachers):

   A. Create 3 modal directories:
      - modals/{entity}/add-{entity}/
      - modals/{entity}/update-{entity}/
      - modals/{entity}/delete-{entity}/

   B. In each directory, create 3 files:
      - add-{entity}.modal.ts (use Add pattern above)
      - add-{entity}.modal.html (use Add template above)
      - add-{entity}.modal.css (empty or minimal styling)

   C. Repeat for update and delete variants

2. Customize for each entity:
   - Replace {{ Entity }} with entity name (e.g., Student, Assessment)
   - Replace {{ entity }} with entity variable (e.g., student, assessment)
   - Add entity-specific form fields in templates
   - Update validation logic in submit()

3. Register modals in page components:
   - Import modal components
   - Add to @Component imports array
   - Add ViewChild decorators
   - Reference in template HTML

4. Build and test:
   ng build --configuration development
   ng serve --configuration development
*/
