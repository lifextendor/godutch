//导航栏
import React from 'react';
import {Navbar,Nav,NavItem,MenuItem,NavDropdown}from 'react-bootstrap';
import $ from 'jquery';

var myItems=[
    {name:"团1",num:"8"},
    {name:"团2",num:"9"},
    {name:"团3",num:"10"}
    ];
const NavbarInstance = React.createClass({
    loadCommentsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    //在初始化渲染执行之后立刻调用一次，仅客户端有效（服务器端不会调用）。
    componentDidMount: function() {
        this.loadCommentsFromServer();
    },
    getInitialState: function() {
        return {data: [],username:""};
    },
    render: function() {
        return (
            <Navbar inverse>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a className="mytitle" href="#">AA</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <MyNavItem href="#panel" name="创建团"/>
                        <MyNavDropdown items={myItems} selectItem="选择团"/>
                        <MyNavItem href="#panel" name="管理团队"/>
                        <MyNavItem name="管理账本"/>
                    </Nav>
                    <Nav pullRight>
                        <MyNavItem name="<%= user %>"/>
                        <MyNavItem name="退出"/>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
});

//菜单栏
const MyNavItem = React.createClass({
    handleClick: function () {
        PubSub.publish('products', this.props.name);
    },
    render: function() {
        return (
            <NavItem onClick={this.handleClick}>{this.props.name}</NavItem>
        );
    }
});

//下拉菜单
const MyNavDropdown = React.createClass({
        getInitialState: function() {
    return {
        selectItem: "选择团"
    };
},
handleClick: function (i) {
    PubSub.publish('items', this.props.items[i].name);
    this.setState({selectItem:this.props.items[i].name});
},
render: function() {
    return (
        <NavDropdown title={this.state.selectItem} id="basic-nav-dropdown">
        {this.props.items.map(function(item, i) {
            return (
                <MenuItem onClick={this.handleClick.bind(this, i)} key={i}>{item.name}</MenuItem>
        );
        }, this)}
        </NavDropdown>
    );
    }
});
export default NavbarInstance;
