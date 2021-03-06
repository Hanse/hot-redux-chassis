/// <reference path='./index.d.ts'/>

import '@babel/polyfill';
import 'isomorphic-fetch';
import 'file-loader?name=[name].[ext]!./humans.txt';

import configureStore from 'app/configureStore';
import { createBrowserHistory } from 'history';
import React from 'react';
import { render } from 'react-dom';

import Root from './Root';

if (__DEV__) {
  (global as any).React = React;
}

const history = createBrowserHistory();
const store = configureStore(history);

const rootElement = document.getElementById('root') as HTMLElement;

render(<Root {...{ store, history }} />, rootElement);
