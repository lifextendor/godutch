//账单
import React from 'react';
import { Form, Input, Card, Table, Button, DatePicker, notification } from 'antd';
const FormItem = Form.Item;
var username=window.userName; 
notification.config({
      top: 60,
      duration: 3,
    }) 


class account extends React.Component{ 
    constructor(props) {
        super(props);
        this.state = {id:this.props.params.id, teamlist:[], data:[], selectedRowKeys: []};     
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
                    num:{"n":"1","k":data.result.members[i].userId},
                  });
                }
                this.setState({teamlist:data.result.members,data:moneydata,knum:knum});         
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }
    handleChange(name) {
      console.log(`selected ${name}`);      
    }
    start(e) {      
        this.props.form.validateFields((errors, values) => {
            console.log(values);
            if (!!errors) {
                this.errorMessage();
                console.log('Errors in form!!!');
                this.errorMessage();
                return;
            }  
            if (this.state.selectedRows<=0) {
                this.errorMessage();
                return;
            }          
            var ns = 0;
            for (var i = this.state.selectedRows.length - 1; i >= 0; i--) {
                ns+=parseInt(this.state.selectedRows[i].num.n);
            }
            var average = values.money/ns; 
            if (e.target.innerText=="花 费") {
                average=-average;
            }            
            var members = "[";
            for (var i = this.state.selectedRows.length - 1; i >= 0; i--) {
               var member={};
               member.provider=this.state.selectedRows[i].provider;
               member.user_id=this.state.selectedRows[i].key;
               member.money=average*this.state.selectedRows[i].num.n+parseInt(this.state.selectedRows[i].balance);
               var json='{"provider":"'+member.provider+'","user_id":"'+member.user_id+'","money":"'+member.money+'"}';
               members+=json;
               if (i>0) {members+=","};
            }   
            members+="]";        
            $.ajax({
            url: "/users/group/"+this.state.id+"/updatemoney",
            dataType: 'json',
            type: 'put',
            async: true,
            data: {total:values['money'],members:members,dateTime:values.time},
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
        this.setState({selectedRowKeys: []});
    }       
    inputChange(e){
        var newdata=this.state.data;
        for (var i = this.state.data.length - 1; i >= 0; i--) {
            if(e.target.id==newdata[i].key){
                newdata[i].num.k=e.target.id;
                newdata[i].num.n=e.target.value;
            }
        }
        this.setState({data:newdata});
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
        {title: '余额',dataIndex: 'balance'}, 
        {
            title: '人数',
            dataIndex: 'num',
            width: 70,
            render: (num) => <Input id={num.k} value={num.n} onChange={this.inputChange.bind(this)}/>,
          }
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
                                <FormItem wrapperCol={{ span: 18, offset: 7 }}>
                                  <Button type="primary" onClick={this.start.bind(this)}>花费</Button>
                                  &nbsp;
                                  <Button type="primary" onClick={this.start.bind(this)}>充值</Button>
                                </FormItem>
                                </Form>
                            </div>
                            <Table rowSelection={rowSelection} columns={columns} dataSource={this.state.data} />
                        </div>
                    </Card>
                </div>            
    }
}
account = Form.create()(account)
export default account;
