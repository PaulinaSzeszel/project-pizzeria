import { select, templates, settings } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(element) {
    const thisBooking = this;

    /* generate HTML from tempates */
    const generatedHTML = templates.bookingWidget();

    /* generate empty object thisBooking.dom */
    thisBooking.dom = {};

    /* add and assing wrapper to thisBooking.dom */
    thisBooking.dom.wrapper = element;

    /* add generated HTML to wrapper.innerHTML*/
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function () {
      thisBooking.removeTableSelection();
    });

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function () {
      thisBooking.removeTableSelection();
    });

    thisBooking.datePicker = new DatePicker (thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker (thisBooking.dom.hourPicker);
  }

  getData(){
   const thisBooking = this;

   const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
   const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

   const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

   const urls = {
      bookings:      settings.db.url + '/' + settings.db.bookings
                                      + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events
                                      + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.events
                                      + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
    .then(function(allResponse){
       const bookingResponse = allResponse[0];
       const eventsCurrentResponse = allResponse[1];
       const eventsRepeatResponse = allResponse[2];
       return Promise.all ([
         bookingResponse.json(),
         eventsCurrentResponse.json(),
         eventsRepeatResponse.json(),
       ]);
     })
     .then(function([bookings, eventsCurrent, eventsRepeat]){
     // console.log('bookings',bookings);
     // console.log('eventsCurrent', eventsCurrent);
     // console.log('eventsRepeat', eventsRepeat);
       thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
     });
 }
}

export default Booking;
