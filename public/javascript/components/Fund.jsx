//账单
import React from 'react';
import {Link} from 'react-router';
import { Form, Input, Card, Button, DatePicker, notification } from 'antd';
const FormItem = Form.Item;
var username=window.userName; 
notification.config({
      top: 60,
      duration: 3,
    }) 


class fund extends React.Component{ 
    constructor(props) {
        super(props);
        this.state = {id:this.props.params.id, teamlist:[], data:{money:0}, selectedRowKeys: []};     
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
    componentDidMount(){
        $.ajax({
            url: "/users/group/"+this.state.id,
            dataType: 'json',
            type: 'get',
            async: true,
            success: function(data) {
                debugger
                const moneydata = {};
                moneydata.id = data.result.members[0].userId,
                moneydata.name = data.result.members[0].user_name,
                moneydata.provider = data.result.members[0].provider,
                moneydata.money = data.result.members[0].money,

                this.setState({teamlist:data.result.members,data:moneydata});         
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }
    start(e) {      
        this.props.form.validateFields((errors, values) => {
            debugger
            console.log(values);
            if (!!errors) {
                this.errorMessage();
                console.log('Errors in form!!!');
                return;
            } 
            var stringTime = (new Date(values.time)).toLocaleDateString() + " 00:00:00";
            var time = (new Date(stringTime)).getTime();
            var money = parseInt(this.state.data.money) + parseInt(values.money);              
            var members='[{"provider":"'+ this.state.data.provider +'","user_id":"'+ this.state.data.id +'","money":"'+ money +'"}]'; 
            var bill='[{"provider":"'+ this.state.data.provider +'","user_id":"'+ this.state.data.id +'","money":"'+ money +'","name":"'+member.name+'"}]'; 
            $.ajax({
            url: "/users/group/"+this.state.id+"/updatemoney",
            dataType: 'json', 
            type: 'put',
            async: true,
            data: {total:values['money'],members:members,dateTime:time,bill:bill},
            success: function(data) {
                this.componentDidMount();  
                this.succesMessage();    
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
                this.errorMessage();
            }.bind(this)
        });              
        });         
    }    
    inputInt(rule, value, callback) {
        var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
        if(value && !reg.test(value)){  
           callback(new Error("输入正确的钱数,最多两位小数!"));
        } else {
          callback();
        }
    }
    render(){
        var that=this;
        const { getFieldProps } = this.props.form;
        const moneyProps = getFieldProps('money', {
          rules: [
            { required: true, message: '不能为空'},
            {validator: this.inputInt},
          ],
        });
        const remarksProps = getFieldProps('remarks', {
          rules: [
            { required: true, message: '备注一下吧' },
          ],
        });
        const timeProps = getFieldProps('time', {
          // rules: [
          //   { required: true, message: '必须选时间' },
          // ],
          initialValue:new Date().getFullYear()+"-"+(parseInt(new Date().getMonth())+parseInt(1))+"-"+new Date().getDate(),
        });

        return  <div style={{ background: '#ECECEC'}}>
                    <Card className="main-panel" title="记账" bordered={false}>
                        <span className="goback"><Link to="teamManage">返回</Link></span>
                        <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10">
                            <div style={{ marginBottom: 16 }}>
                                <Form horizontal form={this.props.form}>
                                <FormItem
                                  wrapperCol={{ span: 8}}
                                  labelCol={{ span: 7 }}
                                  label="剩余金额"                              
                                >
                                  <Input name="remain" disabled="true" value={this.state.data.money}/>                                  
                                </FormItem>
                                <FormItem
                                  wrapperCol={{ span: 8}}
                                  labelCol={{ span: 7 }}
                                  label="进出金额"                              
                                >
                                  <Input {...moneyProps} placeholder="金额" name="money"/>
                                  <span>(正数表示收入，负数表示支出)</span>
                                </FormItem>
                                <FormItem
                                  wrapperCol={{ span: 8}}
                                  labelCol={{ span: 7 }}
                                  label="备注"                              
                                >
                                  <Input {...remarksProps} placeholder="备注" name="remarks"/>
                                </FormItem>
                                <FormItem 
                                  wrapperCol={{ span: 12}}
                                  labelCol={{ span: 7 }}
                                  required
                                  label="选择时间" 
                                >
                                  <DatePicker {...timeProps} name="time" format="yyyy-MM-dd" />
                                </FormItem>                                
                                <FormItem wrapperCol={{ span: 12, offset: 7 }}>
                                  <Button type="primary" onClick={this.start.bind(this)}>提交</Button>                                  
                                </FormItem>
                                </Form>
                            </div>                            
                        </div>
                    </Card>
                </div>            
    }
}
fund = Form.create()(fund)
export default fund;
