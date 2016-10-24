//账单
import React from 'react';
import { Card, Table, Button, Select } from 'antd';
import Message from './message';
const Option = Select.Option;
var username=window.userName;

class Messages extends React.Component{
    constructor(props) {
        super(props);
        this.state = {messages:[]};
    }
    componentDidMount(){
        $.ajax({
            url: "/users/messages",
            dataType: 'json',
            type: 'get',
            async: true,
            success: function(data) {
                if(data.result&&data.result.length>0){
                    this.setState({messages:data.result});
                }else{
                    this.setState({messages:[]});
                }
            }.bind(this),
            error: function(xhr, status, err) {
                debugger;
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }
    handleChange(name) {
        console.log(`selected ${name}`);
        for (var i = this.state.teamlist.length - 1; i >= 0; i--) {
            if (name==this.state.teamlist[i].id) {
                if (this.state.teamlist[i].ishead) {
                    this.setState({ispower:'ok'});
                }
                else{
                    this.setState({ispower:'hidden',isaccount:'hidden',isselect:''});
                }
                break;
            }
        }
    }
    start(e) {
        this.setState({loading: true});
        // 模拟 ajax 请求，完成后清空
        setTimeout(() => {
            this.setState({
                selectedRowKeys: [],
            });
        }, 1000);
    }
    render(){
        const { messages } = this.state;
        var messageViews = [];
        var me = this;
        messages.forEach(function(msg){
            messageViews.push(<Message success = {me.componentDidMount} failed = {me.componentDidMount} message={msg}/>)
        });
        return  <div style={{ background: '#ECECEC'}}>
            <Card className="main-panel" title="消息管理" bordered={false}>
                <div>{messageViews}</div>
                </Card>
            </div>
    }
}
// billManage.defaultProps={teamItems:teamItems};//设置默认属性
export default Messages;
