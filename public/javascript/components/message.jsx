//账单
import React from 'react';
import { Card, Table, Button, Select, Row, Col } from 'antd';
import $ from 'jquery';
const Option = Select.Option;

class Message extends React.Component{
    constructor(props) {
        super(props);
    }
    componentDidMount(){

    }
    handleChange(name) {

    }
    render(){
        const { message } = this.props;
        var title,content =(<div>messages</div>);
        switch (message.type){
            case 'invite':
                title = '邀请';
                content = (<div><div>{message.invitor}邀请你加入{message.group}团队</div><Row>
                    <Col span={2} offset={6}><Button type="primary">同意</Button></Col>
                    <Col span={2} offset={6}><Button type="primary">拒绝</Button></Col>
                </Row></div>);
                break;
            case 'bill':
                title = '账单';
                break;
            default :
                title = '消息';
        }
        return  <Card title={title} bordered={false}>{content}</Card>
    }
}
// billManage.defaultProps={teamItems:teamItems};//设置默认属性
export default Message;
