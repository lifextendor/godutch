//创建团
import React from 'react';
import {Card, Form, Input, Button, Checkbox, message } from 'antd';
const FormItem = Form.Item;

class createTeam extends React.Component{
    constructor(props) {
        super(props);   
    }
    handleReset(e) {
        e.preventDefault();
        this.props.form.resetFields();
    }
    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((errors, values) => {
          if (!!errors) {
            console.log('Errors in form!!!');
            return;
          }

          console.log('Submit!!!');
          console.log(values);

          message.success('操作成功!');
         $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: values,
            success: function(data) {
                //跳转到团组，添加团员
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
        });        
    }
    userExists(rule, value, callback) {
      debugger
        if (!value) {
          callback();
        } else {
          $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: value,
            success: function(data) {
                console.log(data);
            }.bind(this),
            error: function(xhr, status, err) {
                callback([new Error('抱歉，该用户名已被占用。')]);
            }.bind(this)
        });
      }
    }
    render() {  
        const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
        const nameProps = getFieldProps('name', {
          rules: [
            { required: true, min: 2, max: 4, message: '用户名至少为 2 个字符' },
            { validator: this.userExists },
          ],
        });
        const textareaProps = getFieldProps('textarea', {
          rules: [
            { required: true, message: '真的不打算写点什么吗？' },
          ],
        });
        const formItemLayout = {
          labelCol: { span: 7 },
          wrapperCol: { span: 12 },
        };
        return  <div style={{ background: '#ECECEC'}}>
                    <Card className="main-panel" title="创建团" bordered={false}>
                      <div className="col-xs-12 col-sm-12 col-md-6 col-md-offset-3 col-lg-6 col-lg-offset-3">                       
                        <Form horizontal form={this.props.form}>
                            <FormItem
                              {...formItemLayout}
                              label="团名称"
                              hasFeedback
                              help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
                            >
                              <Input {...nameProps} placeholder="实时校验，输入 JasonWood 看看" />
                            </FormItem>
                            <FormItem
                              {...formItemLayout}
                              label="简介"
                            >
                              <Input {...textareaProps} type="textarea" placeholder="随便写" id="textarea" name="textarea" />
                            </FormItem>

                            <FormItem wrapperCol={{ span: 12, offset: 7 }}>
                              <Button type="primary" onClick={this.handleSubmit.bind(this)}>确定</Button>
                              &nbsp;&nbsp;&nbsp;
                              <Button type="ghost" onClick={this.handleReset.bind(this)}>重置</Button>
                            </FormItem>
                          </Form>
                        </div>  
                    </Card>
                </div>          
    }
}
createTeam = Form.create()(createTeam)
export default createTeam;
