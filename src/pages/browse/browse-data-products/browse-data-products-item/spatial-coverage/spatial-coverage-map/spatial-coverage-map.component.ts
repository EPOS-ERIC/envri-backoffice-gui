/* eslint-disable @typescript-eslint/dot-notation */
import { AfterViewInit, Component, Input } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.fullscreen';
import { Subject } from 'rxjs';
import { SpatialCoverageType } from 'src/utility/enums/spatialCoverageType.enum';

@Component({
  selector: 'app-spatial-coverage-map',
  templateUrl: './spatial-coverage-map.component.html',
  styleUrls: ['./spatial-coverage-map.component.scss'],
})
export class SpatialCoverageMapComponent implements AfterViewInit {
  public mapIdentifier: string = '';
  @Input() set mapId(value: string) {
    this.mapIdentifier = value;
  }
  @Input() spatialRange: Array<string | undefined> = [''];
  @Input() coordinatesChange: Subject<Array<string | undefined>> = new Subject();

  public map: L.Map | undefined;

  public ngAfterViewInit(): void {
    this.initMap(this.mapIdentifier);
    this.initSubs();
  }

  private initMap(mapId: string): void {
    const OSMLink = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    const tiles = L.tileLayer('https://tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: `| Powered by ${OSMLink}`,
    });
    this.map = L.map('map-' + mapId, {
      center: [45, 3],
      zoom: 3,
      zoomControl: true,
      touchZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: true,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: 'topleft',
        content: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z"/></svg>`,
      },
    });
    tiles.addTo(this.map);
    this.getDataOnMaps();
  }

  private initSubs() {
    this.coordinatesChange.subscribe((v) => {
      this.spatialRange = v;
      this.map?.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polygon) {
          this.map?.removeLayer(layer);
        }
      });
      setTimeout(() => {
        this.getDataOnMaps();
      }, 100);
    });
  }

  private getDataOnMaps() {
    this.spatialRange.forEach((block) => {
      if (this.spatialRange !== undefined && block !== '') {
        this.getPolygonFromString(block).then((coordinates) => {
          if (coordinates.length !== 0) {
            if (block?.includes(SpatialCoverageType.POINT)) {
              const icon = new L.Icon.Default();
              icon.options.shadowSize = [0, 0];
              icon.options.imagePath = 'assets/img/leaflet/';
              icon.options.iconUrl = 'marker-icon.png';
              icon.options.shadowUrl = 'marker-shadow.png';
              const spatialPoint = new L.Marker({ lat: coordinates[0][0], lng: coordinates[0][1] }, { icon: icon });
              if (this.map !== undefined) {
                spatialPoint.addTo(this.map);
                this.map.flyTo({ lat: coordinates[0][0], lng: coordinates[0][1] });
              }
            } else {
              const globalBbox = new L.Polygon(coordinates as Array<L.LatLngTuple>);

              if (this.map !== undefined) {
                globalBbox.addTo(this.map);
                this.map.panTo(coordinates[0] as L.LatLngTuple);
              }
            }
          }
        });
      }
    });

    if (this.spatialRange.length > 1) {
      this.map?.setZoom(0);
    }
  }

  private getPolygonFromString(stringPolygon: string | undefined): Promise<Array<Array<number>>> {
    let regex = /\(\((.*?)\)\)/g;
    if (stringPolygon?.includes(SpatialCoverageType.POINT)) {
      regex = /\((.*?)\)/g;
    }
    const matches: Array<Array<number>> = [];

    let match;

    if (stringPolygon !== undefined) {
      while ((match = regex.exec(stringPolygon)) !== null) {
        match[1].split(',').map((value) => {
          const coord = value.trim().split(' ');
          matches.push([Number(coord[1]), Number(coord[0])]);
        });
      }
    }

    return new Promise((resolve) => {
      resolve(matches);
    });
  }
}
