//账单
import React from 'react';
import { Form, Input, Card, Table, Button, DatePicker, Select, notification } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
var username=window.userName; 
notification.config({
      top: 60,
      duration: 3,
    }) 

class debt extends React.Component{ 
    constructor(props) {
        super(props);
        this.state = {id:this.props.params.id, teamlist:[], data:[], host:"", selectedRowKeys: []};     
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
                const moneydata = [];
                const knum = {};
                for (var i = data.result.members.length - 1; i >= 0; i--) {
                    moneydata.push({
                    key: data.result.members[i].userId,
                    name: data.result.members[i].user_name,
                    provider: data.result.members[i].provider,
                    balance: data.result.members[i].money,
                  });
                }
                this.setState({teamlist:data.result.members,data:moneydata,knum:knum});         
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
            if (this.state.selectedRows<=0) {
                this.errorMessage();
                return;
            }    
            var stringTime = values.time + " 00:00:00";
            var time = Date.parse(new Date(stringTime));
            time = time / 1000;      
            var ns = this.state.selectedRows.length;
            var average = values.money/ns;            
            var members = "[";
            var bill="[";
            for (var i = this.state.selectedRows.length - 1; i >= 0; i--) {                            
               var member={};
               if (this.state.selectedRows[i].name==this.state.host) {
                    member.money=average*(ns-1)+parseInt(this.state.selectedRows[i].balance);
               }else{
                    member.money=this.state.selectedRows[i].balance-average;
               }
               member.provider=this.state.selectedRows[i].provider;
               member.user_id=this.state.selectedRows[i].key;               
               var json='{"provider":"'+member.provider+'","user_id":"'+member.user_id+'","money":"'+member.money+'"}';
               var billjson='{"provider":"'+member.provider+'","user_id":"'+member.user_id+'","money":"'+average+'"}';
               members+=json;
               bill+=json;
               if (i>0) {
                    members+=",";
                    bill+=",";
                };
            }   
            members+="]"; 
            bill+="]";         
            $.ajax({
            url: "/users/group/"+this.state.id+"/updatemoney",
            dataType: 'json',
            type: 'put',
            async: true,
            data: {total:values['money'],members:members,dateTime:time,bill:bill},
            success: function(data) {
                this.succesMessage();
                this.componentDidMount();      
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
                this.errorMessage();
            }.bind(this)
        });              
        }); 
        this.setState({selectedRowKeys: [],selectedRows:[]});         
    }       
    selectChange(name){
        console.log(`selected ${name}`);
        this.setState({host:name});
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
            { required: true, message: '不能为空' },
            {validator: this.inputInt},
          ],
        });
        const timeProps = getFieldProps('time', {
          // rules: [
          //   { required: true, message: '必须选时间' },
          // ],
          initialValue:new Date().getFullYear()+"-"+(parseInt(new Date().getMonth())+parseInt(1))+"-"+new Date().getDate(),
        });
        const { selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange(selectedRowKeys, selectedRows) {          
                that.setState({selectedRows:selectedRows,selectedRowKeys:selectedRowKeys});
            }
        }
        const columns = [
        {title: '姓名',dataIndex: 'name'}, 
        {title: '类型',dataIndex: 'provider'}, 
        {title: '余额',dataIndex: 'balance'}
        ];
        return  <div style={{ background: '#ECECEC'}}>
                    <Card className="main-panel" title="记账" bordered={false}>
                        <div className="col-md-offset-2 col-sm-offset-0 col-md-8 col-sm-12">
                            <div style={{ marginBottom: 16 }}>
                                <Form horizontal form={this.props.form}>
                                <FormItem
                                  wrapperCol={{ span: 8}}
                                  labelCol={{ span: 7 }}
                                  label="输入金额"                              
                                >
                                  <Input {...moneyProps} placeholder="金额" name="money"/>
                                </FormItem>
                                <FormItem 
                                  wrapperCol={{ span: 12}}
                                  labelCol={{ span: 7 }}
                                  required
                                  label="选择时间" 
                                >
                                  <DatePicker {...timeProps} name="time" format="yyyy-MM-dd" />
                                </FormItem>
                                <FormItem
                                  wrapperCol={{ span: 12}}
                                  labelCol={{ span: 7 }}
                                  required
                                  label="选择付费者"
                                  >
                                    <Select showSearch
                                    style={{ width: 150 }}
                                    placeholder="选择付费者"
                                    optionFilterProp="children"
                                    notFoundContent="无法找到"
                                    onChange={this.selectChange.bind(this)}
                                    >
                                    {this.state.data.map(function(list, i) {
                                    return (
                                        <Option value={list.name}>{list.name}</Option>
                                        );
                                    }, this)}
                                    </Select>
                                </FormItem>
                                <FormItem wrapperCol={{ span: 12, offset: 7 }}>
                                  <Button type="primary" onClick={this.start.bind(this)}>提交花费</Button>                                  
                                </FormItem>
                                </Form>
                            </div>
                            <Table rowSelection={rowSelection} columns={columns} dataSource={this.state.data} bordered />
                        </div>
                    </Card>
                </div>            
    }
}
debt = Form.create()(debt)
export default debt;
