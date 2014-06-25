var overDiv = document.createElement('div');
overDiv.id='dialogoverlay';
document.body.appendChild(overDiv);

var boxDiv = document.createElement('div');
boxDiv.id='dialogbox';
document.body.appendChild(boxDiv);

var headDiv = document.createElement('div');
headDiv.id='dialogboxhead';
boxDiv.appendChild(headDiv);

var bodyDiv = document.createElement('div');
bodyDiv.id='dialogboxbody';
boxDiv.appendChild(bodyDiv);

var footDiv = document.createElement('div');
footDiv.id='dialogboxfoot';
boxDiv.appendChild(footDiv);
