// ==UserScript==
// @name           YouTube Auto Series, Play Next Video Script
// @namespace      vidzbigger.com
// @description    Automatically plays the next video based on sequential titles, supporting increasing detail such as Season III Episode 4 Part B
// @include        http://www.youtube.com/watch*
// ==/UserScript==

// Any comercial use of any functionality should be compensated
// If you compensate me for use of this functionality I will 
// share your payment with any contributions that are involved

var tit=document.getElementsByTagName('meta');
var maxRomanNumeral = 30;
var checkDoneRate = 5000; //5000 = 5 seconds

// the check done rate is used since it is less reliable to attempt
// to attach a state change listener since it will reload 
// the player in the process and interrupt video

function _ge(e){
  return document.getElementById(e);
}

for(var i=0,l=tit.length;i<l;i++){
  if(tit[i].name='title'){
    tit=tit[i].content;
    break;
  }
}
//http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
function deromanize( roman ) {
  var roman = roman.replace(/\s/g,'').toUpperCase(),
      lookup = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000},
      arabic = 0,
      i = roman.length;
  while (i--) {
    if ( lookup[roman[i]] < lookup[roman[i+1]] )
      arabic -= lookup[roman[i]];
    else
      arabic += lookup[roman[i]];
  }
  return arabic;
}
function romanize(num) {
  var lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},
      roman = '',
      i;
  for ( i in lookup ) {
    while ( num >= lookup[i] ) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}//thanks to Iván -DrSlump- Montes

function prepNumbers(a){
	var rn,rexp;
	a=a.toUpperCase()+' ';
  
  rn=a.match(/[^A-z0-9](M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3}))/g);// adapted from http://stackoverflow.com/questions/267399/how-do-you-match-only-valid-roman-numerals-with-a-regular-expression
	if( rn && rn.length > 0 ){
	  for( i=maxRomanNumeral; i>0; i-- ){
	  	a=a.replace(new RegExp("[^A-z0-9]"+romanize(i),"g")," "+i);
		}
  }
  
  for(var l = 65; l < 91; l++ ){
	  var rexp = new RegExp("(([^A-z0-9])["+String.fromCharCode(l)+"](?=[^A-z0-9]))","g");
	  a = a.replace(rexp,' '+(l-64));
	}
	return a;
}

//the letters in the strings should be preped first using prepNumbers
function compareLetters(a,b){
  var zmisa,zmisb,rmisa,rmisb;
  
  zmisa=a.match(/[A-z]+/g); //becomes redundent
  zmisb=b.match(/[A-z]+/g);
  
  rmisa=a.match(/[.\d]+/g); //becomes redundent
  rmisb=b.match(/[.\d]+/g);
  
  if(rmisa&&rmisb  && zmisa&&zmisb && zmisa.join('')==zmisb.join('') ){
  	//GM_log(zmisa + '-' +zmisb + '=' + rmisa + '-' + rmisb);
	  //should have same number of numbers??
	  if( rmisa.length == rmisb.length ){
	    var len=Math.max(rmisa.length,rmisb.length);
		  for(var i=len-1;i>=0;i--){
		    if(  rmisa[i]!=rmisb[i] && rmisa[i]-0 < rmisb[i]-0 ){
					//console.log('='+ rmisa + '=' + rmisb + '=');
					for( q=i-1; a>=0;a-- ){
						if( rmisa[q]!=rmisb[q] )
							return false;// while detail is incremented, other numbers mismatch
					}
			  	return rmisb[i]-0;
			  }
		  }
		}
	}
  return false;
}

function finda(n){
  if(n.parentNode&&n.parentNode.tagName!='A'){
    return finda(n);
  }
  return n.parentNode;
}

var found=[],fc=0;
var ti=document.getElementsByClassName('title')

function seekNextTrack(){
	var titest=prepNumbers(tit);
	for(var i=0,l=ti.length;i<l;i++){
	  var tid = ti[i].title;
	   posb=compareLetters(titest,prepNumbers(tid));
	   if(posb){
	    var hrf=finda(ti[i]).href;
	    hrf = hrf.substr(0,hrf.indexOf('&'));
	    if(!found[hrf]){
	      found.push(posb+'|||'+hrf+'|||'+tid);
	      fc++;
	    }
	   }
	}
}

function getJSobj(p){if(typeof(p.wrappedJSObject)!='undefined')return p.wrappedJSObject;return p;}

var th1='';
function testReadyToNav(){
  if(_ge('movie_player') && getJSobj(_ge('movie_player')).getPlayerState()===0){
  	//console.log('navigating to next video '+th1);
    window.location=th1
    
  }else{
    setTimeout(testReadyToNav,checkDoneRate);
  }
}

function startListening(){
	if(!_ge('movie_player')){
		setTimeout(startListening,10000);
		return;
	}
	getJSobj(_ge('movie_player')).addEventListener("onStateChange", onytplayerStateChange,false);
	//console.log('try2');
	//_ge('movie_player').addEventListener("onStateChange", onytplayerStateChange,false);
	//console.log('try3');

}

function onytplayerStateChange(s){
	if( s === 0 ){
		console.log('psc readynave');
		//testReadyToNav();
		window.location=th1
	}
  console.log(s)
}

function sortfunction(a, b){
	a=a.split('|||')[0];
	b=b.split('|||')[0];
	return (a - b) //causes an array to be sorted numerically and ascending
}

seekNextTrack();

if( fc>0 ){
	
  found.sort(sortfunction);
	
	//for( i in found){GM_log(found[i]);}

  for( i in found){

   th1=found[i];
   if(th1.indexOf('|||')>0){
   	found[i]=th1.split('|||')
    th1=found[i][1]
   }
   try{	
    console.log('next video in series: ' + th1 + ' ' +(found[i][2]?found[i][2]:''));
   }catch(e){}
   break;
  }
  setTimeout(testReadyToNav,10000);
  setTimeout(startListening,10001);

}else if( fc==0 ){
  console.log('no next video in series found');
}else{
  console.log('no next video in series identified, conficts exist, report this video to script author qufighter[at]gmail[dot]com include this URL: '+ window.location.href);
}