//导航
import React from 'react';
import { Card, Form, Input, Button, notification } from 'antd';
const FormItem = Form.Item;
notification.config({
      top: 60,
      duration: 3,
    }) 

class feedback extends React.Component{  
    openNotificationWithIcon() {
      return notification['success']({
          message: '成功',
          description: '反馈意见提交成功！',
        });
    } 
    handleSubmit(e) {
        e.preventDefault();
        console.log('收到表单值：', this.props.form.getFieldsValue());
        this.openNotificationWithIcon();
    }           
    render(){        
        const { getFieldProps } = this.props.form;
        return	<div style={{ background: '#ECECEC'}}>
                <Card className="main-panel" title="反馈" bordered={false}>
                <div className="col-xs-12 col-sm-12 col-md-6 col-md-offset-3 col-lg-6 col-lg-offset-3">  
    				<h1>感谢使用!</h1>
                    <br/>
                    <p>在这里留下你宝贵的意见</p>
                    <br/>
                    <Form horizontal onSubmit={this.handleSubmit}>
                        <FormItem
                          wrapperCol={{ span: 24 }}
                          help="客观，留下点什么嘛"
                        >
                          <Input type="textarea" rows="12" placeholder="随便写" {...getFieldProps('feedback', { initialValue: '' })}/>
                        </FormItem>
                        <FormItem  style={{ marginTop: 24 }}>
                          <Button type="primary" onClick={this.handleSubmit.bind(this)}>提交</Button>
                        </FormItem>
                    </Form>
                </div>
                </Card>
                </div>
    }
}
feedback = Form.create()(feedback);
export default feedback;