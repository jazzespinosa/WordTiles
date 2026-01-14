import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FeedbackDto, FeedbackResponse } from './feedback.model';
import { Environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private readonly environment = new Environment();
  private baseUrl = this.environment.getApiUrl();

  constructor(private http: HttpClient) {}

  submitFeedback(feedback: FeedbackDto): Observable<FeedbackResponse> {
    return this.http.post<FeedbackResponse>(
      `${this.baseUrl}/api/Util/feedback`,
      feedback,
    );
  }
}
