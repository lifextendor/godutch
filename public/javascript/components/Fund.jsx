//账单
import React from 'react';
import { Form, Input, Card, Button, DatePicker } from 'antd';
const FormItem = Form.Item;
import $ from 'jquery';
var username=window.userName; 


class fund extends React.Component{ 
    constructor(props) {
        super(props);
        this.state = {id:this.props.params.id, teamlist:[], data:{money:0}, selectedRowKeys: []};     
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
            debugger
            var money = parseInt(this.state.data.money) + parseInt(values.money);              
            var members='[{"provider":"'+ this.state.data.provider +'","user_id":"'+ this.state.data.id +'","money":"'+ money +'"}]'; 
            $.ajax({
            url: "/users/group/"+this.state.id+"/updatemoney",
            dataType: 'json',
            type: 'put',
            async: true,
            data: {total:values['money'],members:members,dateTime:values.time},
            success: function(data) {
                debugger
                this.componentDidMount();      
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });              
        });         
    }       
    render(){
        var that=this;
        const { getFieldProps } = this.props.form;
        const moneyProps = getFieldProps('money', {
          rules: [
            { required: true, message: '金额必须是数字' },
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
