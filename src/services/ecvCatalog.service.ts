import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { firstValueFrom } from 'rxjs';

interface EcvLResponse {
  '@context': object;
  '@graph': Array<{
    '@id': string;
    '@type': string;
    'skos:prefLabel': SkosPrefLabel;
  }>;
}

interface SkosPrefLabel {
  '@language': string;
  '@value': string;
}

const normalizeEcvUri = (value: string): string => value.trim().replace(/^http:\/\//i, 'https://').replace(/\/$/, '');

@Injectable({
  providedIn: 'root',
})
export class EcvCatalogService {
  private catalog = new Map<string, string>();

  private readonly catalogSubject = new BehaviorSubject<Map<string, string>>(new Map());

  public catalogObs = this.catalogSubject.asObservable();

  private loadPromise?: Promise<Map<string, string>>;

  constructor(private readonly http: HttpClient) {}

  public loadECVs(): Promise<Map<string, string>> {
    if (this.loadPromise != null) {
      return this.loadPromise;
    }

    this.loadPromise = this.fetchCatalog().catch((error) => {
      this.loadPromise = undefined;
      console.warn('Failed to load ECV catalog', error);
      return this.catalog;
    });

    return this.loadPromise;
  }

  public getCatalog(): Map<string, string> {
    return new Map(this.catalog);
  }

  private async fetchCatalog(): Promise<Map<string, string>> {
    const response = await firstValueFrom(
      this.http.get<EcvLResponse>('https://vocab.nerc.ac.uk/collection/EXV/current/?_profile=nvs&_mediatype=application/ld+json'),
    );

    const nextMap = new Map<string, string>();
    if (Array.isArray(response?.['@graph'])) {
      response['@graph'].forEach((item) => {
        const uri = item['@id'];
        const name = item['skos:prefLabel']?.['@value'];
        if (uri && name) {
          nextMap.set(normalizeEcvUri(uri), name);
        }
      });
    }

    this.catalog = nextMap;
    this.catalogSubject.next(this.getCatalog());
    return this.getCatalog();
  }
}
