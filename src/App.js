import React, { Component } from 'react';

const firebase = require('firebase');

var config = {
  apiKey: "AIzaSyDyRukiPIej168d6elewuZpF7VR4P0ueWU",
  authDomain: "ethnic-grocery-stores.firebaseapp.com",
  databaseURL: "https://ethnic-grocery-stores.firebaseio.com",
  storageBucket: "ethnic-grocery-stores.appspot.com",
  messagingSenderId: "131961135840"
};
firebase.initializeApp(config);

import Header from './Header';
import GMap from './GMap';
import AddStore from './AddStore';
import Sidebar from './Sidebar';
import Admin from './Admin';
import Message from './Message';

const toArrayTypes = obj =>
  Object.keys(obj || {})
  .map(id => ({ id, name: obj[id] }))
  .sort((a, b) => a.name > b.name);

class App extends Component {
  state = {
    storeTypes: [],
    user: null,
    token: null,
    filter: 'Show all',
    'add-store': false,
    message: {
      show: false,
      text: ''
    }
  };

  componentDidMount() {
    firebase.database().ref('storeTypes').on('value', snapshot => {
      this.setState({
        storeTypes: toArrayTypes(snapshot.val())
      });
    });

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ user });
      } else {
        this.setState({ user: { email: '' } });
      }
    });
  }

  render() {
    return (
      <div onClick={e => {
        if (!e.target.classList.contains('popup-name') && !e.target.classList.contains('avatar')) {
          this.setState({ popup: 'hidden' });
        }
      }}>
        {/* <button onClick={ () => {
          firebase.database().ref('stores').push({
            title: Math.random()
          });
        }}>
          Go
        </button>
        <ul>
        {
          this.state.stores.map(store =>
            <li key={ store.id }>{ store.title }</li>
          )
        }
        </ul> */}

        <Header onLogin={ (user, token) => {
          this.setState({ user, token });
          console.log(user);
        }} onAvaClick={ () => {
          this.setState({ popup: 'visible' });
        }} onAddStore={ () => {
          this.setState({ 'add-store': true });
        }} onFilterChange={ e => {
          this.setState({ filter: e.target.value });
        }}
        popup={this.state.popup}
        user={this.state.user} token={this.state.token}
        storeTypes={this.state.storeTypes}>
          <div>3</div>
        </Header>
        <Sidebar currentStore={this.state.currentStore} />
        <GMap filter={this.state.filter}
          onOpenStore={ store => {
            this.setState({ currentStore: store });
          }}
        />

        {
          this.state['add-store'] ?
            <div className="map-screen"></div>
            : ''
        }

        <Message ref="msg" msg={this.state.message} />

        {
          this.state['add-store'] ?
            <AddStore onSubmit={form => {
              firebase.database().ref('newStores').push({
                ...form,
                senderName: this.state.user.displayName,
                senderEmail: this.state.user.email
              });
            }} onClose={msg => {
              this.setState({ 'add-store': false });

              if (msg) {
                this.setState({ message: { show: true, text: msg } });

                setTimeout(() => {
                  this.setState({ message: { show: false, text: msg } });
                }, 2000);
              }

            }} storeTypes={this.state.storeTypes} />
            : ''
        }

        <Admin />
      </div>
    );
  }
}

export default App;
