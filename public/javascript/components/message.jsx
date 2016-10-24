//账单
import React from 'react';
import { Card, Table, Button, Select, Row, Col } from 'antd';
const Option = Select.Option;
import '../stylesheets/message.scss';

class Message extends React.Component{
    constructor(props) {
        super(props);
    }
    componentDidMount(){

    }
    handleAgree(evt) {
        const { message,success,failed } = this.props;
        var messageId = message.id;
        $.ajax({
            url: "/users/message/" + messageId + "/reply/agree",
            dataType: 'json',
            type: 'get',
            async: true,
            success: function(data) {
                if(data.result&&data.result.length>0){
                    this.setState({messages:data.result});
                }
                if(success){
                    success();
                }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(err);
                if(failed){
                    failed();
                }
            }.bind(this)
        });
    }
    handleReject(evt) {
        const { message,success,failed } = this.props;
        var messageId = message.id;
        $.ajax({
            url: "/users/message/" + messageId + "/reply/reject",
            dataType: 'json',
            type: 'get',
            async: true,
            success: function(data) {
                if(data.result&&data.result.length>0){
                    this.setState({messages:data.result});
                }
                if(success){
                    success();
                }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
                if(failed){
                    failed();
                }
            }.bind(this)
        });
    }
    render(){
        const { message } = this.props;
        var title,content =(<div>messages</div>);
        switch (message.type){
            case 'invite':
                title = '邀请';
                content = (<div><div className='message-content'>{message.invitor.user_name}邀请你加入{message.group}团队</div>
                    <div className='message-footer'>
                        <Button type="primary" data-type='reject' size="large" onClick={this.handleReject.bind(this)}>拒绝</Button>
                        <Button type="primary" data-type='agree'  size="large" onClick={this.handleAgree.bind(this)}>同意</Button>
                    </div></div>);
                break;
            case 'bill':
                title = '账单';
                break;
            case 'info':
                title = '消息';
                content = (<div><div className='message-content'>{message.content}</div></div>);
                break;
            default :
                title = '消息';
        }
        return  <Card className='message' title={title} bordered={false}>{content}</Card>
    }
}
// billManage.defaultProps={teamItems:teamItems};//设置默认属性
export default Message;
