import React from 'react';
import ReactDOM from 'react-dom';
// 引入React-Router模块
import { Router, Route, Link, hashHistory, IndexRoute, Redirect, IndexLink} from 'react-router'
// 引入单个页面（包括嵌套的子页面）
import Nav from './components/nav';
import navigation from './components/navigation';
import createTeam from './components/createTeam';
import teamManage from './components/teamManage';
import numManage from './components/numManage';
import billManage from './components/billManage';
import './stylesheets/index.scss'

class App extends React.Component{ 
  render(){
    return  <div className="page-wrapper">
              <div className="row">
                <Nav name='导航'/>
              </div>
              <div className="main-wrapper">
                <div className="row">
                  <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10 col-xs-12">
                     { this.props.children }
                  </div>
                </div>
              </div> 
            </div>
      }
}
// 配置路由
ReactDOM.render((
    <Router history={hashHistory} >
        <Route path="/" component={App}>
            <IndexRoute path="" component={navigation} />
            <Route path="createTeam" component={createTeam} />
            <Route path="teamManage/:username" component={teamManage} /> 
            <Route path="numManage/:id/:power" component={numManage} />
            <Route path="billManage/:username" component={billManage} />
        </Route>
    </Router>
), document.getElementById('react-content'));  
