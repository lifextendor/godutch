//创建团
import React from 'react';
import {Card, Form, Input, Select, Button, Checkbox, notification } from 'antd';
const FormItem = Form.Item;
notification.config({
      top: 60,
      duration: 3,
    }) 

class createTeam extends React.Component{  
    constructor(props) {
        super(props);   
    }
    succesMessage() {
      return notification['success']({
          message: '成功',
          description: '操作成功！',
        });
    }
    errorMessage() {
      return notification['error']({
          message: '失败',
          description: '操作失败！',
        });
    } 
    handleReset(e) {
        e.preventDefault();
        this.props.form.resetFields();
    }
    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((errors, values) => {
          if (!!errors) {
            this.errorMessage();
            console.log('Errors in form!!!');
            return;
          }
          $.ajax({
            url: "/users/creategroup",
            dataType: 'json',
            type: 'put',
            data: values,
            success: function(data) {
                console.log("提交成功");
                this.succesMessage();
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(this.props.url, status, err.toString());
                this.errorMessage();
            }.bind(this)
          });
        });        
    }
    render() {  
        const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
        const nameProps = getFieldProps('gname', {
          rules: [
            { required: true, min: 2, max: 8, message: '用户名在2至8个字符之间' },
            // { validator: this.userExists },
          ],
        });
        const textareaProps = getFieldProps('description', {
          rules: [
            { required: true, message: '真的不打算写点什么吗？' },
          ],
        });

        const texttypeProps = getFieldProps('type', {
          rules: [
            { required: true},
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
                            >
                              <Input {...nameProps} placeholder="团队名称" name="gname"/>
                            </FormItem>
                            <FormItem
                              {...formItemLayout}
                              label="类型"
                            >
                              <Select {...texttypeProps} size="large" defaultValue="normal" name="type">
                                <Option value="normal">吃饭团账本</Option>
                                <Option value="bill">合租账本</Option>
                                <Option value="fund">活动经费</Option>
                              </Select>
                            </FormItem>
                            <FormItem
                              {...formItemLayout}
                              label="简介"
                            >
                              <Input {...textareaProps} type="textarea" placeholder="随便写" name="description"/>
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
