import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren} from '@angular/core';

@Component({
  selector: 'smart-autocomplete',
  templateUrl: './ngx-smart-autocomplete.component.html',
  styleUrls: ['./ngx-smart-autocomplete.component.less']
})
export class NgxSmartAutocompleteComponent implements OnInit {
  @Input() displayData: any;
  @Input() en: any;
  @Input() maxCount: any;
  @Input() fetchData: any;
  @ViewChild('inputField') inputField: ElementRef;
  @ViewChildren('prefixItems') prefixItems;
  @Output() fetchMethod: EventEmitter<any> = new EventEmitter();

  inputModel: any;

  prefixData: any;
  destData: any;

  autoCompleteDisplayFlag: boolean;
  autoCompleteLoadingFlag: boolean;
  hiddenFlag: boolean;
  viewportStart: number;
  viewportEnd: number;
  message: any;

  constructor() {
  }

  ngOnInit() {
    this.hiddenFlag = false;
    this.inputModel = '';
    this.autoCompleteDisplayFlag = false;
    this.autoCompleteLoadingFlag = false;
    this.doInitViewport();

    this.destData = this.displayData || [];
    this.prefixData = [];
  }

  ngOnChanges() {
    this.prefixData = this.makeDefaultActiveFlag(this.fetchData || []);
    this.autoCompleteDisplayFlag = true;
    this.autoCompleteLoadingFlag = false;
    this.message = {
      loading: !!this.en ? 'Loading...' : '正在匹配...',
      empty: !!this.en ? 'No matching data' : '抱歉，没有匹配数据',
      tips: !!this.en ? 'Press enter' : '按回车'
    };
  }

  onKeyup(event: KeyboardEvent) {
    if (this.maxCount && ((this.destData.length + 1) > this.maxCount)) return;
    this.hiddenFlag = false;
    if (event.keyCode === 13) {
      if (this.prefixData.length) {
        this.addToDestData(this.findActiveItem(this.prefixData).item);
      }
      return;
    }
    if (event.keyCode === 40) {
      if (this.prefixData.length) {
        let currentIndex = this.findActiveItem(this.prefixData).index;
        let max = this.prefixData.length - 1;
        if (currentIndex < max) {
          this.prefixData[currentIndex]['activeFlag'] = false;
          this.prefixData[currentIndex + 1]['activeFlag'] = true;
          this.triggerScrollIntoView(currentIndex + 1, true);
        }
      }
      return;
    }
    if (event.keyCode === 38) {
      if (this.prefixData.length) {
        let currentIndex = this.findActiveItem(this.prefixData).index;
        if (currentIndex > 0) {
          this.prefixData[currentIndex]['activeFlag'] = false;
          this.prefixData[currentIndex - 1]['activeFlag'] = true;
          this.triggerScrollIntoView(currentIndex - 1, false);
        }
      }
      return;
    }
    this.autoCompleteDisplayFlag = false;
    let query = this.inputModel.trim();
    if (!query) return;
    this.autoCompleteLoadingFlag = true;
    this.fetchAutoCompleteData(query);
  }

  triggerScrollIntoView(index: number, toDown: boolean) {
    let array = this.prefixItems.toArray();
    if (toDown) {
      if (index > this.viewportEnd) {
        array[index].nativeElement.scrollIntoViewIfNeeded(false);
        this.viewportStart += 1;
        this.viewportEnd += 1;
      }
    } else {
      if (index < this.viewportStart) {
        array[index].nativeElement.scrollIntoViewIfNeeded(false);
        this.viewportStart -= 1;
        this.viewportEnd -= 1;
      }
    }

  }

  doInitViewport() {
    this.viewportStart = 0;
    this.viewportEnd = 9;
  }

  makeDefaultActiveFlag(data: any) {
    this.doInitViewport();
    if (!data.length) return data;
    data[0]['activeFlag'] = true;
    return data;
  }

  deleteItem(list, index) {
    list.splice(index, 1);
  }

  addToDestData(item: any) {
    if (!this.checkIfExist(this.destData, item)) this.destData.push(item);
    this.inputModel = '';
    this.autoCompleteDisplayFlag = false;
  }

  checkIfExist(list: any, item: any) {
    let flag = list.some(obj => {
      return obj.id === item.id;
    });
    return flag;
  }

  findActiveItem(data: any) {
    let activeItem: any;
    let activeIndex: number;
    data.some((item, index) => {
      if (item.activeFlag) {
        activeItem = item;
        activeIndex = index;
        return true;
      }
    });
    return {
      index: activeIndex,
      item: activeItem
    };
  }

  fetchAutoCompleteData(query: string) {
    this.fetchMethod.emit(query);
  }

  readyForInput() {
    this.inputField.nativeElement.focus();
  }

  blurInput() {
    setTimeout(() => {
      this.hiddenFlag = true;
    }, 500);
  }

}
