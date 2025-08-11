// src/templates/templates.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplatesService {
  getVerificationResultPage(params: {
    success: boolean;
    title: string;
    message: string;
    details?: string;
    actionUrl?: string;
    actionText?: string;
  }): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${params.title}</title>
      <style>
        :root {
          --color-primary: #FFD166;
          --color-success: #06D6A0;
          --color-error: #EF476F;
          --color-text: #5E4200;
          --color-bg: #FFF9E6;
          --color-card: #FFFDF5;
        }
        body {
          font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: var(--color-bg);
          margin: 0;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          color: var(--color-text);
        }
        .card {
          background: var(--color-card);
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 500px;
          width: 100%;
          text-align: center;
        }
        .icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        .success {
          color: var(--color-success);
        }
        .error {
          color: var(--color-error);
        }
        h1 {
          margin-top: 0;
          margin-bottom: 1rem;
        }
        p {
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        .details {
          background: rgba(0,0,0,0.05);
          padding: 1rem;
          border-radius: 4px;
          font-family: monospace;
          margin: 1.5rem 0;
          word-break: break-word;
        }
        .button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: var(--color-primary);
          color: var(--color-text);
          text-decoration: none;
          border-radius: 4px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .footer {
          margin-top: 2rem;
          font-size: 0.8rem;
          color: rgba(0,0,0,0.5);
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">${params.success ? '✓' : '✗'}</div>
        <h1 class="${params.success ? 'success' : 'error'}">${params.title}</h1>
        <p>${params.message}</p>
        
        
        <div class="footer">
          ${new Date().getFullYear()} © Daily Spark App - All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;
  }
}