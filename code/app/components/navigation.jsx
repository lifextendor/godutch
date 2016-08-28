//导航
import React from 'react';
import { Card } from 'antd';

class navigation extends React.Component{          
    render(){
        return	<div style={{ background: '#ECECEC'}}>
                <Card className="main-panel" title="导航" bordered={false}>
    				<h1>欢迎来到AA!</h1>
                    <br/>
                    <p>在这里你将拥有更简单更方便的组团记账分摊方式。</p>
                    <br/>
                    <p>快去创建你的团，和小伙伴们约起来吧！</p>
                </Card>
                </div>
    }
}
export default navigation;