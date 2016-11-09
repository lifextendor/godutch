//导航栏
import React from 'react';
import { Button, Icon, Badge } from 'antd';
// 引入React-Router模块
import {Link} from 'react-router';
import '../stylesheets/nav.scss';

var username=window.userName;
var rootPath = window.rootPath

class nav extends React.Component{ 
  constructor(props) {
        super(props);
        this.state={username:username,rootPath:rootPath};
    }   
    render() { 
      const { style, size, placeholder } = this.props;
      return  <header>
                <nav className="navbar navbar-default navbar-fixed-top">
                  <div className="container">
                  <div className="row">
                    <div className="col-xs-10 col-sm-1 col-md-1 col-lg-1">
                      <div className="navbar-header">
                        <img src="../../images/logo.png" style={{height: "46px"}}/>
                      </div>
                    </div>                

                    <div className="hidden-xs col-lg-7 col-md-6 col-sm-6">
                      <ul className="nav navbar-nav">
                        <li><Link to="createTeam">建团</Link></li>                      
                        <li><Link to="teamManage">团队</Link></li>
                        <li><Link to="billManage">账单</Link></li>
                        <li><Link to='messages'><Badge dot={(window.messages>0)}>消息</Badge></Link></li>
                      </ul>  
                    </div>                                 

                    <div className="hidden-xs col-sm-4 col-md-3 col-lg-3">
                      <div id="navbar" className="navbar-collapse collapse">
                        <ul className="nav navbar-nav navbar-right">                       
                          <li><a href="#">{username}</a></li>
                          <li><a href={this.state.rootPath+'/logout'}>退出</a></li>
                          <li><Link to="feedback">反馈</Link></li>
                        </ul>
                      </div>
                    </div>

                    <div className="visible-xs-block col-xs-2">
                      <div className="nav nav-hamburger">
                        <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                          <Icon type="plus" />
                        </a>
                        <ul className="dropdown-menu pull-right">                       
                          <li><a href="#">{username}</a></li>
                          <li><a href={this.state.rootPath+'/logout'}>退出</a></li>
                          <li><Link to="feedback">反馈</Link></li>
                        </ul>
                      </div>               
                    </div>
                  </div>
                  </div>
                </nav>

                <nav className="visible-xs navbar navbar-default navbar-fixed-bottom">
                  <div id="main-nav">
                    <ul className="nav navbar-nav">
                        <li><Badge dot={(window.messages>0)}><Icon type="aliwangwang-o" /></Badge><Link to="messages">消息</Link></li>   
                        <li><Icon type="plus-square" /><Link to="createTeam">建团</Link></li>                      
                        <li><Icon type="team" /><Link to="teamManage">团队</Link></li>
                        <li><Icon type="book" /><Link to="billManage">账单</Link></li>                                    
                      </ul>
                  </div>
                </nav>
              </header>      
        }
}
nav.defaultProps={controller:'导航'};//设置默认属性
export default nav;
