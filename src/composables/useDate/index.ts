import moment from 'moment';

export function useDate() {

  /**
  ** 
  **/
  const formatDateStore = ( value: string | number | Date ) => {

    /**
    ** TODO: #locale
    ** @see sm\node_modules\moment\locale\ru.js
    **/
    moment.updateLocale( 'ru', {

      months : [
        
        'Января', 'Февраля', 
        'Марта', 'Апреля', 
        'Мая', 'Июня', 
        'Июля', 'Августа', 
        'Сентября', 'Октября', 
        'Ноября', 'Декабря',
      
      ]

    } );

    return moment
      .parseZone( value )
      .local()
      .format( 'DD MMMM YYYY, HH:mm' )
      .toLowerCase();

  };
  
  /**
  ** 
  **/
  const formatDateFirst = ( value: string | number | Date ) => {

    return moment
      .parseZone( value )
      .local()
      .format( 'DD.MM.YYYY, HH:mm' );

  };
  /**
  ** 
  **/
  const formatDateOnly = ( value: string | number | Date ) => {

    return moment
      .parseZone( value )
      .local()
      .format( 'DD.MM.YYYY' );

  };

  /**
  ** Convert local time to UTC time.
  **/
  const formatDateToUtc = ( val: string | number | Date, format: string = 'YYYY-MM-DDTHH:mm:ssZ' ) => {

    return moment( val )
      .utc()
      .format( format );

  };

  /**
  ** Convert UTC time to local time.
  **/
  const formatDateToLocal = ( val: string | number | Date, format: string = 'YYYY-MM-DDTHH:mm:ssZ' ) => {

    return moment
      .parseZone( val )
      .local()
      .format( format );

  };

  const formatDateOnlyToUtc = ( val: string | number | Date, format: string = 'YYYY-MM-DD' ) => {

    return moment( val )
      .utc()
      .format( format );

  };
  
  return { 
    
    formatDateStore,    
    formatDateFirst,
    formatDateOnly,
    
    formatDateToUtc,
    formatDateOnlyToUtc,
    formatDateToLocal,
  
  };

};
