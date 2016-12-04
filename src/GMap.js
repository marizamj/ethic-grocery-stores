import React, { Component } from 'react';

const firebase = require('firebase');

const API_KEY = 'AIzaSyDhOc5OMsksRlpNfJFxk-fOGwGLeeBDoCo';

const url = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;

const toArrayStores = obj =>
  Object.keys(obj || {}).map(id => ({ id, ...obj[id] }));


let google;
let map;

class GMap extends Component {
  state = {
    stores: [],
    markers: []
  };

  renderMarkers(props = this.props, state = this.state) {
    state.markers.forEach(marker => {
      marker.setMap(null);
    });

    let storesToShow;

    if (props.filter === 'Show all') {
      storesToShow = state.stores;
    } else {
      storesToShow = state.stores.filter(store =>
        store.type.split(', ').some(type => type === props.filter));
    }

    const newMarkers = storesToShow.map(store => {
      return new google.maps.Marker({
        position: store.latLng,
        title: store.name,
        store
      });
    });

    this.setState({ markers: newMarkers });

    newMarkers.forEach(marker => {
      marker.setMap(map);
      marker.addListener('click', () => this.props.onOpenStore(marker.store));
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.filter !== this.props.filter) {
      this.renderMarkers(nextProps, nextState);
    }
  }

  componentDidMount() {
    const script = document.createElement('script');

    script.onload = () => {
      google = window.google;

      map = new google.maps.Map(this.refs.node, {
        center: { lat: 52.368717, lng: 4.867490 },
        zoom: 12
      });

      firebase.database().ref('stores').on('value', snapshot => {
        this.setState({
          stores: toArrayStores(snapshot.val())
        }, () => this.renderMarkers());
      });
    };

    document.body.appendChild(script);
    script.src = url;
  }

  render() {
    return <div ref="node" className="gmap"></div>
  }
}

export default GMap;
