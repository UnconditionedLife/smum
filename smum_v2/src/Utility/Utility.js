import React, { Component } from 'react';
import $ from 'jquery';

const aws = "https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/prod"

class Utility extends Component {

  static changeWordCase(str){
  	str = str.replace(/[^\s]+/g, function(word) {
  	  return word.replace(/^./, function(first) {
  	    return first.toUpperCase();
  	  });
  	});
  	return str
  }
}
export default Utility;
