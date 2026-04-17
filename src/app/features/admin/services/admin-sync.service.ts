import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/assessment/environment';
import {
  AdminItemResponse,
  AdminQueryParams
} from '../models/admin-api.model';
import { AdminSyncPayload, AdminSyncStatus } from '../models/admin-sync.model';
import { AdminEndpointService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class AdminSyncService extends AdminEndpointService {
  constructor() {
    super('sync');
  }

  sync(payload: AdminSyncPayload = {}): Observable<AdminItemResponse<AdminSyncStatus>> {
    return this.http.post<AdminItemResponse<AdminSyncStatus>>(
      this.collectionUrl(),
      payload
    );
  }

  status(params?: AdminQueryParams): Observable<AdminItemResponse<AdminSyncStatus>> {
    return this.http.get<AdminItemResponse<AdminSyncStatus>>(
      `${environment.apiUrl}/admin/sync/status`,
      this.requestOptions(params)
    );
  }
}
