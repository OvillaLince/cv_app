import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MyApiService {
  private apiUrl = 'https://localhost:5001/api'; // Use your actual endpoint

  constructor(private http: HttpClient) {}

  getExampleData() {
    return this.http.get(`${this.apiUrl}/weatherforecast`);
  }
}