//账单
import React from 'react';
import { Card, Table, Button, Select } from 'antd';
const Option = Select.Option;
import $ from 'jquery';
// import '../stylesheets/teamManage.scss'
   
var teamlist=[
    {name:"团1",num:"8",id:"1",ishead:false,isnew:false}, 
    {name:"团2",num:"8",id:"2",ishead:false,isnew:true},
    {name:"团3",num:"8",id:"3",ishead:true,isnew:false},
    {name:"团4",num:"8",id:"4",ishead:false,isnew:false},
    {name:"团5",num:"8",id:"5",ishead:false,isnew:false},
    {name:"团6",num:"8",id:"6",ishead:false,isnew:false},
    {name:"团7",num:"8",id:"7",ishead:false,isnew:false},
    {name:"团8",num:"8",id:"8",ishead:false,isnew:false},
    {name:"团9",num:"8",id:"9",ishead:false,isnew:false},
    {name:"团10",num:"8",id:"10",ishead:false,isnew:false},
    {name:"团11",num:"8",id:"11",ishead:false,isnew:false},
    {name:"团12",num:"8",id:"12",ishead:false,isnew:false},
    {name:"团13",num:"8",id:"13",ishead:false,isnew:false},
    {name:"团14",num:"8",id:"14",ishead:false,isnew:false},
    {name:"团15",num:"9",id:"15",ishead:false,isnew:false},
    {name:"团16",num:"10",id:"16",ishead:false,isnew:false}
    ];    

const columns = [
    {title: '姓名',dataIndex: 'name'}, 
    {title: '余额',dataIndex: 'age'}, 
    {title: '备注',dataIndex: 'address'}
    ];

const data = [];
for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    name: `李大嘴${i}`,
    age: 32,
    address: `西湖区湖底公园${i}号`,
  });
}

class billManage extends React.Component{ 
    constructor(props) {
        super(props);
        this.state = {selectedRowKeys: [], loading: false, teamlist: teamlist, username: this.props.params.username,
            isaccount:'hidden',ispower:'hidden',isselect:''};     
    }
    handleChange(name) {
      console.log(`selected ${name}`);
      for (var i = this.state.teamlist.length - 1; i >= 0; i--) {
          if (name==this.state.teamlist[i].id) {
            if (this.state.teamlist[i].ishead) {
                 this.setState({ispower:'no'});
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
            loading: false,
          });
        }, 1000);
      }
    account(e){
        this.setState({isaccount:'no',isselect:'rowSelection={rowSelection}'});
        
    }      
    onSelectChange(selectedRowKeys) {
        console.log('selectedRowKeys changed: ', selectedRowKeys);       
        this.setState({ selectedRowKeys });
    }
    // handleCommentSubmit: function(comment) {
    //     alert("确认提交");
    //     $.ajax({
    //         url: this.props.url,
    //         dataType: 'json',
    //         type: 'POST',
    //         data: comment,
    //         success: function(data) {
    //             this.setState({data: data});
    //         }.bind(this),
    //         error: function(xhr, status, err) {
    //             this.setState({data: comments});
    //             console.error(this.props.url, status, err.toString());
    //         }.bind(this)
    //     });
    // }
    render(){
        const { loading, selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange.bind(this),
        };
        const hasSelected = selectedRowKeys.length > 0;
        const options = this.state.teamlist.map(d => <Option key={d.id}>{d.name}</Option>);
        var isnew="", ishead=false;
        {this.state.teamlist.map(function(d, i) {
            if(d.isnew){
                isnew=d.name;
                if(d.ishead){
                    ishead=true;
                    this.state.ispower='no';
                };
                return;
            };
        }, this)}
        return  <div style={{ background: '#ECECEC'}}>
                    <Card className="main-panel" title="账单管理" bordered={false}>
                        <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10">
                        <Select showSearch
                            style={{ width: 200,marginBottom:20 }}
                            placeholder="请选择团"
                            optionFilterProp="children"
                            notFoundContent="无法找到"
                            onChange={this.handleChange.bind(this)}
                            defaultValue={isnew}
                          >
                            {options}
                        </Select>
                        &nbsp;&nbsp;&nbsp;
                        <Button type="primary" className={this.state.ispower} style={{marginBottom:20}} onClick={this.account.bind(this)}>记账</Button>
                        </div>
                        <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10">
                            <div style={{ marginBottom: 16 }}>
                                <Button className={this.state.isaccount} type="primary" onClick={this.start.bind(this)} loading={loading}>花费</Button>
                                 &nbsp;&nbsp;&nbsp;
                                <Button className={this.state.isaccount} type="primary" onClick={this.start.bind(this)} loading={loading}>充值</Button>
                                <span style={{ marginLeft: 8 }}>{hasSelected ? `选择了 ${selectedRowKeys.length} 个团员` : ''}</span>
                            </div>
                            <Table columns={columns} dataSource={data} />
                        </div>
                    </Card>
                </div>            
    }
}
// billManage.defaultProps={teamItems:teamItems};//设置默认属性
export default billManage;
