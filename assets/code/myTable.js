// ------ 这是我自己写的table组件，基础使用方式就是antd的table组件的使用方式 -
import React from 'react';
import styles from './index.scss';

// ---------- 自定义表格组件 -------------
// ---------- 函数组件 且无状态，仅展示数据 ------------

function MyShelterTable(props) {
  const {
    tableHeader, //  ---- 表格表头 ----
    tableData, // ---- 表格数据对象 ----
  } = props;

  // ----- key生成函数 -----
  const getKey = () => {
    const chars =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_=-';
    const length = Math.round(Math.random() * 10);
    let result = '';
    for (let i = length; i >= 0; i--) {
      const index = Math.round(Math.random() * 65);
      result += chars[index];
    }
    return result;
  };

  // ---------------- 以下函数与多级表头功能有关 ----------------
  // ------- 为tableHeader数据添加层级标识 -------
  const getTableHeaderWithLevel = (arr) => {
    // ------ 遵守不改变props中值的策略 -------
    let tableHeaderWithLevel = arr.concat();

    // 私有函数
    function setLevel(arr, level) {
      level++;
      arr.map((item) => {
        item.level = level;
        if (item.children) {
          setLevel(item.children, level);
        }
      });
    }

    setLevel(tableHeaderWithLevel, 0);

    // ---- 并生成新的数组对象tableHeaderWithLevel ------
    return tableHeaderWithLevel;
  };

  // ---- 获取最深等级函数 ----
  const getDepth = (arr) => {
    let depth = 0;

    // --- 私有函数---
    function depthFun(arr) {
      arr.map((item) => {
        if (item.level > depth) {
          depth = item.level;
        }
        if (item.children) {
          depthFun(item.children);
        }
      });
    }

    depthFun(arr);
    return depth;
  };

  // ---- 递归获取子孙总数量函数 ----
  const getSonCount = (obj) => {
    let number = obj.children.length;

    //  --- 私有函数 ---
    function getSonCountFun(arr) {
      arr.map((item) => {
        if (item.children) {
          number = number + item.children.length - 1;
          getSonCountFun(item.children);
        }
      });
    }

    getSonCountFun(obj.children);
    return number;
  };

  // --- 递归获取最底层元素函数 ----
  const getBottomItem = (obj) => {
    let resultArr = [];

    // 私有函数
    function getBottomItemFun(arr) {
      arr.map((item) => {
        if (!item.children) {
          resultArr.push(item);
        } else {
          getBottomItemFun(item.children);
        }
      });
    }
    getBottomItemFun(obj.children);
    return resultArr;
  };
  // ---------------- 以上函数与多级表头生成有关 --------------

  // --------- 以下代码与表格行设置有关 ----------

  // ------- 为单独行设置独有类名函数 --------
  // ------- 通过table的props传递进来 -------
  // ----- 在条件渲染tr的时候进行判断设置 -----
  const rowSettingFun = (region) => {
    const { rowClassName, judgmentFun } = props.rowSetting;
    // ------ 表格行设置对象 -------
    // ----- 待设置类名、判断条件函数 ----
    if (judgmentFun(region)) {
      return rowClassName;
    } else {
      return '';
    }
  };
  // --------- 以上代码与表格行设置有关 ----------

  // -------- getTable函数 ------------
  const getTable = () => {
    if (!tableData) return null;
    const tableHeaderWithLevel = getTableHeaderWithLevel(tableHeader);
    const depth = getDepth(tableHeaderWithLevel);
    let arr = [];
    return (
      <table className={styles.myTable}>
        <thead className={styles.tableHeader}>
          {
            // ------ 表头行渲染（根据层级） -------
            new Array(depth).fill('').map((item, index) => {
              let currentArr;
              index === 0
                ? (currentArr = tableHeaderWithLevel)
                : (currentArr = arr.concat());
              arr = [];
              return (
                <tr key={getKey()}>
                  {
                    // ----- 表头单元渲染 -----
                    currentArr.map((item) => {
                      // ------ 有子元素 ------
                      if (item.children) {
                        arr.push(item.children);
                        return (
                          // ---- 横向合并量为其子孙总数量 ----
                          <th
                            style={{
                              width: item.width ? item.width + 'px' : 'unset',
                            }}
                            key={getKey()}
                            colSpan={getSonCount(item)}
                          >
                            {item.title}
                          </th>
                        );
                      }
                      // ------ 首行且无子元素 ------
                      else if (!item.children && item.level === 1) {
                        arr.push('');
                        return (
                          <th
                            style={{
                              width: item.width ? item.width + 'px' : 'unset',
                            }}
                            key={getKey()}
                            rowSpan={depth - item.level + 1}
                          >
                            {item.title}
                          </th>
                        );
                      }
                      // ------ 被剥出的子元素数组 ------
                      else if (Array.isArray(item) && item.length) {
                        return item.map((item) => {
                          if (item.children) {
                            arr.push(item.children);
                            return (
                              <th key={getKey()} colSpan={getSonCount(item)}>
                                {item.title}
                              </th>
                            );
                          } else {
                            arr.push('');
                            return (
                              <th
                                key={getKey()}
                                datatype={item.level}
                                rowSpan={depth - item.level + 1}
                              >
                                {item.title}
                              </th>
                            );
                          }
                        });
                      } else {
                        // ---- 填充 ----
                        arr.push('');
                      }
                    })
                  }
                </tr>
              );
            })
          }
        </thead>

        <tbody className={styles.tableBody}>
          {
            // ------ 表数据渲染 ------
            // ------ 行数据渲染(由tableData决定) ------
            tableData.map((dataItem, tableDataIndex) => {
              return (
                <tr
                  key={getKey()}
                  className={rowSettingFun(dataItem.regionName)}
                >
                  {
                    // ----- 列数据渲染(由tableHeader决定) ------
                    tableHeaderWithLevel.map((headerItem) => {
                      if (!headerItem.children) {
                        // --- 非多级表头 ----
                        if (headerItem.render) {
                          // ----- 如果该表头对象中声明的自定义渲染函数 -----
                          const key = headerItem.dataIndex;
                          return (
                            <td key={getKey()}>
                              {headerItem.render(
                                dataItem[key], // ---- 单元格数据 -----
                                dataItem, // ---- 行数据 -----
                                tableDataIndex, // ---- 索引 -----
                              )}
                            </td>
                          );
                        } else {
                          // ------ 依据tableData渲染 ------
                          const key = headerItem.dataIndex;
                          return <td key={getKey()}>{dataItem[key]}</td>;
                        }
                      } else {
                        // --- 多级表头 ---
                        // --- 此处需要通过递归函数获取其最底部item ---
                        const bottomItemArr = getBottomItem(headerItem);

                        return bottomItemArr.map((item) => {
                          const key = item.dataIndex;
                          if (item.render) {
                            // ----- 该item存在自定义渲染的情况 ------
                            return (
                              <td key={getKey()}>
                                {item.render(
                                  dataItem[key], // ---- 单元格数据 -----
                                  dataItem, // ---- 行数据 -----
                                  tableDataIndex, // ---- 索引 -----
                                )}
                              </td>
                            );
                          } else {
                            return <td key={getKey()}>{dataItem[key]}</td>;
                          }
                        });
                      }
                    })
                  }
                </tr>
              );
            })
          }
        </tbody>
      </table>
    );
  };

  return getTable();
}

export default MyShelterTable;

