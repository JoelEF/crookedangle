<?php

namespace App\Admin\Controllers;

use App\Upload;
use App\Http\Controllers\Controller;
use Encore\Admin\Controllers\HasResourceActions;
use Encore\Admin\Form;
use Encore\Admin\Grid;
use Encore\Admin\Layout\Content;
use Encore\Admin\Show;

class UploadImagesController extends Controller
{
    use HasResourceActions;

    /**
     * Index interface.
     *
     * @param Content $content
     * @return Content
     */
    public function index(Content $content)
    {
        return $content
            ->header('Index')
            ->description('description')
            ->body($this->grid());
    }

    /**
     * Show interface.
     *
     * @param mixed $id
     * @param Content $content
     * @return Content
     */
    public function show($id, Content $content)
    {
        return $content
            ->header('Detail')
            ->description('description')
            ->body($this->detail($id));
    }

    /**
     * Edit interface.
     *
     * @param mixed $id
     * @param Content $content
     * @return Content
     */
    public function edit($id, Content $content)
    {
        return $content
            ->header('Edit')
            ->description('description')
            ->body($this->form()->edit($id));
    }

    /**
     * Create interface.
     *
     * @param Content $content
     * @return Content
     */
    public function create(Content $content)
    {
        return $content
            ->header('Create')
            ->description('description')
            ->body($this->form());
    }

    /**
     * Make a grid builder.
     *
     * @return Grid
     */
    protected function grid()
    {
        $grid = new Grid(new Upload);

        $grid->id('Id');
        $grid->filename('Filename');
        $grid->resized_name('Resized name');
        $grid->original_name('Original name');
        $grid->category_id('Category id');
        $grid->title('Title');
        $grid->description('Description');
        $grid->created_at('Created at');
        $grid->updated_at('Updated at');


        return $grid;
    }

    /**
     * Make a show builder.
     *
     * @param mixed $id
     * @return Show
     */
    protected function detail($id)
    {
        $show = new Show(Upload::findOrFail($id));

        $show->id('Id');
        $show->filename('Filename');
        $show->resized_name('Resized name');
        $show->original_name('Original name');
        $show->category_id('Category id');
        $show->title('Title');
        $show->description('Description');
        $show->created_at('Created at');
        $show->updated_at('Updated at');

        return $show;
    }

    /**
     * Make a form builder.
     *
     * @return Form
     */
    protected function form()
    {
        $form = new Form(new Upload);

        $form->textarea('filename', 'Filename');
        $form->textarea('resized_name', 'Resized name');
        $form->textarea('original_name', 'Original name');
        $form->textarea('title', 'Title');
        $form->textarea('description', 'description');
        $form->number('category_id', 'Category id');

        return $form;
    }
}
