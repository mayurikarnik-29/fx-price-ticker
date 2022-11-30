import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPrice } from '../interfaces/price.interface';
import { map, Subscription, timer, combineLatest, mergeMap } from 'rxjs';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit, OnDestroy {

  prices!: IPrice[];
  tableHeaders = ['uid', 'instrument', 'bid', 'ask', 'timestamp'];
  subscription!: Subscription;
  //Note: Interval can be updated
  xSeconds = 10000;
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getAllPrices();
    this.subscription = combineLatest([
      timer(10000, this.xSeconds).pipe(mergeMap(() => this.getLatestPrice('EUR/USD'))),
      timer(10000, this.xSeconds).pipe(mergeMap(() => this.getLatestPrice('EUR/JPY'))),
      timer(10000, this.xSeconds).pipe(mergeMap(() => this.getLatestPrice('GBP/USD'))),
    ])
      .pipe(
        map(([response1, response2, response3]) => {
          const result: any[] = [];
          result.push(...response1, ...response2, ...response3)
          return result;
        }))
      .subscribe((data) => {
        data.forEach((latestElement: any) => {
          this.prices = this.prices.map((price: any) => {
            if (price.uid === latestElement.uid)
              return price = latestElement
            else
              return price
          })
        });
      });
  }

  getAllPrices() {
    //Note: Fetching data from local JSON and URL can be updated to point REST API
    this.http.get('assets/mock/prices.json').subscribe((response: any) => {
      this.prices = response.prices;
      console.log(this.prices)
    });
  }


  getLatestPrice(instrument: string) {
    //Note: Added filtering as fetching data from mock. When URL is updated to fetch latest for particular instrument, filtering can be removed
    return this.http.get('assets/mock/latestprices.json').pipe(
      map((list: any) => {
        return list.filter((value: any) => {
          return value.instrument === instrument
        })
      }))
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

}
