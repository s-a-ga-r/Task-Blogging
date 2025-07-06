import frappe


@frappe.whitelist()
def save_task_blogs(postdata):
    pass

    # doc = frappe.new_doc("Tasks")
    # doc.author = frappe.session.user
    # doc.task_name = postdata.