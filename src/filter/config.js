export const ACCEPT_CONFIG = {
    // image: ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
    zip: ['.zip'],
    // document: ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf', '.txt', '.tif', '.tiff'],
    getAll(){
        return [...this.zip]
    }
  }

